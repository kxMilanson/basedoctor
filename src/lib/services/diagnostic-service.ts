import { dataStore } from "./data-store";
import { decryptToken } from "@/lib/crypto";
import { BaseComClient } from "@/lib/base-com/client";
import { runDiagnostics } from "@/lib/diagnostics/engine";
import { DiagnosticScanReport } from "@/types";
import {
  mockInventories,
  mockOrders,
  mockProductsDataMap,
  mockProductsList,
  mockStatuses,
} from "@/test/fixtures/baselinker";

export class DiagnosticService {
  /**
   * Executes a complete read-only diagnostic scan on a shop connection.
   */
  public static async executeScan(
    connectionId: string,
    userId: string
  ): Promise<DiagnosticScanReport> {
    const connection = await dataStore.getConnectionById(connectionId, userId);
    if (!connection) {
      throw new Error("Nie odnaleziono wskazanego połączenia ze sklepem.");
    }

    // Decrypt API token safely server-side
    const plainToken = decryptToken({
      ciphertext: connection.encryptedToken,
      iv: connection.tokenIv,
      tag: connection.tokenTag,
    });

    let productsList = mockProductsList;
    let productsDataMap = mockProductsDataMap;
    let orders = mockOrders;
    let statuses = mockStatuses;
    const isDemoToken = plainToken.startsWith("demo_") || plainToken === "test_token";
    const dataSource: "DEMO_FIXTURES" | "BASE_COM_LIVE" = isDemoToken
      ? "DEMO_FIXTURES"
      : "BASE_COM_LIVE";

    // If it's a real Base.com token (not the demo mock token), fetch live data from Base.com API
    if (!isDemoToken) {
      const client = new BaseComClient({ token: plainToken });

      try {
        const [inventories, fetchedStatuses] = await Promise.all([
          client.getInventories(),
          client.getOrderStatusList(),
        ]);

        if (fetchedStatuses && fetchedStatuses.length > 0) {
          statuses = fetchedStatuses;
        }

        const targetInventoryId =
          connection.defaultInventoryId &&
          !isNaN(Number(connection.defaultInventoryId))
            ? Number(connection.defaultInventoryId)
            : inventories[0]?.inventory_id;

        if (targetInventoryId) {
          // Retrieve paginated products across multiple pages
          const paginatedItems = await client.getInventoryProductsListPaginated(
            targetInventoryId,
            5 // Max 5 pages for scan performance and rate safety
          );

          if (paginatedItems.length > 0) {
            productsList = paginatedItems;
            const productIds = paginatedItems.map((p) => p.id);
            // Retrieve detailed product data in safe chunks of 100 IDs
            const detailedMap = await client.getInventoryProductsDataBatched(
              targetInventoryId,
              productIds,
              100
            );
            productsDataMap = detailedMap || {};
          }
        }

        // Retrieve orders in paginated batches (last 30 days)
        const fetchedOrders = await client.getOrdersPaginated({
          date_from: Math.floor(Date.now() / 1000) - 30 * 86400,
          maxBatches: 3,
        });

        if (fetchedOrders && fetchedOrders.length > 0) {
          orders = fetchedOrders;
        }
      } catch (apiErr: any) {
        console.error("Błąd podczas odpytywania live Base.com API:", apiErr.message);
        throw new Error(
          `Błąd połączenia z Base.com API: ${apiErr.message}. Upewnij się, że token posiada uprawnienia do odczytu zamówień i magazynu.`
        );
      }
    }

    // Run deterministic diagnostic rules engine
    const report = runDiagnostics({
      shopConnectionId: connection.id,
      shopName: connection.name,
      productsList,
      productsDataMap,
      orders,
      statuses,
      dataSource,
    });

    // Persist scan result to database
    const savedRecord = await dataStore.createScanRecord(
      {
        ...report,
        userId,
      },
      report.issues
    );

    return {
      ...report,
      id: savedRecord.id,
    };
  }
}
