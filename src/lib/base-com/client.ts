import {
  BaseLinkerErrorResponse,
  BaseLinkerInventory,
  BaseLinkerOrder,
  BaseLinkerOrderStatus,
  BaseLinkerProductData,
  BaseLinkerProductListItem,
  BaseLinkerResponse,
  BaseLinkerSuccessResponse,
} from "@/types/baselinker";

/**
 * Strict whitelist of permitted read-only Base.com methods.
 * Any non-whitelisted or write operation (e.g. set*, add*, delete*) is strictly rejected.
 */
export const ALLOWED_READ_ONLY_METHODS = new Set<string>([
  "getInventories",
  "getInventoryProductsList",
  "getInventoryProductsData",
  "getInventoryProductsStock",
  "getInventoryProductsPrices",
  "getInventoryWarehouses",
  "getInventoryPriceGroups",
  "getInventoryCategories",
  "getInventoryTags",
  "getInventoryExtraFields",
  "getOrderStatusList",
  "getOrders",
  "getOrderPaymentsHistory",
  "getOrderShipments",
  "getStoragesList",
  "getJournalList",
]);

export class BaseLinkerApiError extends Error {
  public readonly errorCode: string;
  public readonly isAuthError: boolean;
  public readonly isRateLimitError: boolean;

  constructor(errorCode: string, errorMessage: string) {
    super(`Base.com API Error [${errorCode}]: ${errorMessage}`);
    this.name = "BaseLinkerApiError";
    this.errorCode = errorCode;
    this.isAuthError =
      errorCode === "ERROR_AUTH" ||
      errorMessage.toLowerCase().includes("token") ||
      errorMessage.toLowerCase().includes("auth");
    this.isRateLimitError =
      errorCode === "ERROR_RATE_LIMIT" ||
      errorMessage.toLowerCase().includes("limit") ||
      errorMessage.toLowerCase().includes("too many");
  }
}

export class ReadOnlyViolationError extends Error {
  constructor(method: string) {
    super(
      `Naruszenie bezpieczeństwa: BaseDoctor obsługuje wyłącznie operacje w trybie TYLKO DO ODCZYTU. Metoda "${method}" nie znajduje się na liście dozwolonych.`
    );
    this.name = "ReadOnlyViolationError";
  }
}

export interface BaseLinkerClientOptions {
  token: string;
  baseUrl?: string;
  fetchFn?: typeof fetch;
  maxRetries?: number;
}

/**
 * In-memory sliding rate limiter per token to respect Base.com's 100 req/min rule.
 */
class RateLimiter {
  private static timestampsByToken = new Map<string, number[]>();
  private static MAX_REQUESTS_PER_MINUTE = 95; // safe margin below 100

  public static async waitIfNeeded(token: string): Promise<void> {
    const now = Date.now();
    const windowStart = now - 60000;

    let timestamps = this.timestampsByToken.get(token) || [];
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= this.MAX_REQUESTS_PER_MINUTE) {
      const oldestInWindow = timestamps[0];
      const waitTime = oldestInWindow + 60000 - now + 100;
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    timestamps.push(Date.now());
    this.timestampsByToken.set(token, timestamps);
  }
}

export class BaseComClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;
  private readonly maxRetries: number;

  constructor(options: BaseLinkerClientOptions) {
    if (!options.token) {
      throw new Error("Token API Base.com jest wymagany.");
    }
    this.token = options.token.trim();
    this.baseUrl = options.baseUrl || "https://api.baselinker.com/connector.php";
    this.fetchFn = options.fetchFn || fetch.bind(globalThis);
    this.maxRetries = options.maxRetries ?? 3;
  }

  /**
   * Executes a read-only method against the official Base.com API connector.
   */
  public async callMethod<T = Record<string, unknown>>(
    method: string,
    parameters: Record<string, unknown> = {}
  ): Promise<T> {
    // 1. Strict Read-Only Verification
    if (!ALLOWED_READ_ONLY_METHODS.has(method)) {
      throw new ReadOnlyViolationError(method);
    }

    // 2. Rate Limiting Check
    await RateLimiter.waitIfNeeded(this.token);

    const bodyParams = new URLSearchParams();
    bodyParams.append("method", method);
    bodyParams.append("parameters", JSON.stringify(parameters));

    let attempt = 0;
    let delay = 1000;

    while (attempt <= this.maxRetries) {
      attempt++;
      try {
        const response = await this.fetchFn(this.baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-BLToken": this.token,
          },
          body: bodyParams.toString(),
        });

        if (response.status === 429) {
          if (attempt <= this.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
          throw new BaseLinkerApiError(
            "ERROR_RATE_LIMIT",
            "Przekroczono limit zapytań do API Base.com (HTTP 429)."
          );
        }

        if (!response.ok) {
          throw new Error(
            `Błąd sieciowy Base.com: HTTP ${response.status} ${response.statusText}`
          );
        }

        const data = (await response.json()) as BaseLinkerResponse<T>;

        if (data.status === "ERROR") {
          const errData = data as BaseLinkerErrorResponse;
          throw new BaseLinkerApiError(errData.error_code, errData.error_message);
        }

        return data as unknown as T;
      } catch (err: unknown) {
        if (err instanceof ReadOnlyViolationError || err instanceof BaseLinkerApiError) {
          if (err instanceof BaseLinkerApiError && err.isRateLimitError && attempt <= this.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
          throw err;
        }

        if (attempt > this.maxRetries) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw new Error("Nieoczekiwany błąd podczas komunikacji z Base.com API.");
  }

  // Convenient Read-Only Diagnostic Methods

  /**
   * Tests API connection validity by requesting order statuses.
   */
  public async testConnection(): Promise<{
    success: boolean;
    inventoriesCount: number;
    statusesCount: number;
  }> {
    const [inventories, statuses] = await Promise.all([
      this.getInventories(),
      this.getOrderStatusList(),
    ]);

    return {
      success: true,
      inventoriesCount: inventories.length,
      statusesCount: statuses.length,
    };
  }

  /**
   * Retrieves all product catalogs (inventories).
   */
  public async getInventories(): Promise<BaseLinkerInventory[]> {
    const response = await this.callMethod<{ inventories: BaseLinkerInventory[] }>(
      "getInventories",
      {}
    );
    return response.inventories || [];
  }

  /**
   * Retrieves products list for an inventory page.
   */
  public async getInventoryProductsList(
    inventoryId: number,
    page = 1
  ): Promise<{ [productId: string]: BaseLinkerProductListItem }> {
    const response = await this.callMethod<{
      products: { [productId: string]: BaseLinkerProductListItem };
    }>("getInventoryProductsList", {
      inventory_id: inventoryId,
      page,
    });
    return response.products || {};
  }

  /**
   * Retrieves detailed product data for up to 100 products.
   */
  public async getInventoryProductsData(
    inventoryId: number,
    productIds: number[]
  ): Promise<{ [productId: string]: BaseLinkerProductData }> {
    if (productIds.length === 0) return {};
    const response = await this.callMethod<{
      products: { [productId: string]: BaseLinkerProductData };
    }>("getInventoryProductsData", {
      inventory_id: inventoryId,
      products: productIds,
    });
    return response.products || {};
  }

  /**
   * Retrieves paginated products from catalog, iterating across pages.
   */
  public async getInventoryProductsListPaginated(
    inventoryId: number,
    maxPages: number = 5
  ): Promise<BaseLinkerProductListItem[]> {
    const allProducts: BaseLinkerProductListItem[] = [];

    for (let page = 1; page <= maxPages; page++) {
      const pageResult = await this.getInventoryProductsList(inventoryId, page);
      const items = Object.values(pageResult || {});
      if (items.length === 0) break;
      allProducts.push(...items);
      // If fewer items than standard catalog page size (typically 100), no more pages
      if (items.length < 100) break;
    }

    return allProducts;
  }

  /**
   * Retrieves detailed product data in safe chunks of up to 100 IDs (Base.com API constraint).
   */
  public async getInventoryProductsDataBatched(
    inventoryId: number,
    productIds: number[],
    chunkSize: number = 100
  ): Promise<{ [productId: string]: BaseLinkerProductData }> {
    if (productIds.length === 0) return {};

    const combined: { [productId: string]: BaseLinkerProductData } = {};

    for (let i = 0; i < productIds.length; i += chunkSize) {
      const slice = productIds.slice(i, i + chunkSize);
      const batchResult = await this.getInventoryProductsData(inventoryId, slice);
      Object.assign(combined, batchResult);
    }

    return combined;
  }

  /**
   * Retrieves all order statuses.
   */
  public async getOrderStatusList(): Promise<BaseLinkerOrderStatus[]> {
    const response = await this.callMethod<{
      statuses: BaseLinkerOrderStatus[];
    }>("getOrderStatusList", {});
    return response.statuses || [];
  }

  /**
   * Retrieves recent orders.
   */
  public async getOrders(params: {
    date_confirmed_from?: number;
    date_from?: number;
    status_id?: number;
    get_unconfirmed_orders?: boolean;
    id?: number;
  }): Promise<BaseLinkerOrder[]> {
    const response = await this.callMethod<{ orders: BaseLinkerOrder[] }>(
      "getOrders",
      params
    );
    return response.orders || [];
  }

  /**
   * Retrieves orders in paginated batches up to a maximum number of batches.
   */
  public async getOrdersPaginated(params: {
    date_from?: number;
    maxBatches?: number;
  }): Promise<BaseLinkerOrder[]> {
    const maxBatches = params.maxBatches || 3;
    const allOrders: BaseLinkerOrder[] = [];
    let lastOrderId: number | undefined = undefined;

    for (let batch = 0; batch < maxBatches; batch++) {
      const orders = await this.getOrders({
        date_from: params.date_from,
        id: lastOrderId,
        get_unconfirmed_orders: false,
      });

      if (!orders || orders.length === 0) break;
      allOrders.push(...orders);

      if (orders.length < 100) break;

      // Update lastOrderId to highest order_id in this batch for the next request
      const maxIdInBatch = Math.max(...orders.map((o) => o.order_id));
      if (lastOrderId !== undefined && maxIdInBatch <= lastOrderId) break;
      lastOrderId = maxIdInBatch;
    }

    return allOrders;
  }
}
