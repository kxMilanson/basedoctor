import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseComClient, ReadOnlyViolationError } from "@/lib/base-com/client";
import { dataStore } from "@/lib/services/data-store";
import { diagnoseInventory } from "@/lib/diagnostics/rules/inventory";
import { isValidEan } from "@/lib/diagnostics/rules/products";
import { BaseLinkerProductData, BaseLinkerProductListItem } from "@/types/baselinker";

describe("BaseDoctor Integration & Security Tests", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  describe("Base.com Client Pagination & Batching", () => {
    it("pobiera wiele stron produktów aż do wyczerpania lub limitu stron", async () => {
      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(async (url, init) => {
        callCount++;
        const params = new URLSearchParams(init.body);
        const parsed = JSON.parse(params.get("parameters") || "{}");
        const page = parsed.page || 1;

        if (page === 1) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              status: "SUCCESS",
              products: {
                "1": { id: 1, name: "Produkt A", sku: "SKU-A", ean: "5901234123457", quantity: 10, price_brutto: 100 },
                "2": { id: 2, name: "Produkt B", sku: "SKU-B", ean: "5901234123464", quantity: 5, price_brutto: 50 },
              },
            }),
          };
        } else {
          // Page 2 returns empty, signaling end of pagination
          return {
            ok: true,
            status: 200,
            json: async () => ({
              status: "SUCCESS",
              products: {},
            }),
          };
        }
      });

      const client = new BaseComClient({
        token: "live_test_token_123",
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      const products = await client.getInventoryProductsListPaginated(101, 5);
      expect(products).toHaveLength(2);
      expect(products[0].name).toBe("Produkt A");
      expect(callCount).toBe(1); // Since page 1 had < 100 items, loop stopped immediately
    });

    it("dzieli listę 150 produktów na 2 bezpieczne paczki po max 100 ID (Base.com API constraint)", async () => {
      const capturedBatches: number[][] = [];
      const mockFetch = vi.fn().mockImplementation(async (url, init) => {
        const bodyParams = new URLSearchParams(init.body);
        const method = bodyParams.get("method");
        if (method === "getInventoryProductsData") {
          const parsed = JSON.parse(bodyParams.get("parameters") || "{}");
          capturedBatches.push(parsed.products);
          const returnedProducts: Record<string, any> = {};
          for (const id of parsed.products) {
            returnedProducts[id.toString()] = {
              sku: `SKU-${id}`,
              weight: 0.5,
              tax_rate: 23,
            };
          }
          return {
            ok: true,
            status: 200,
            json: async () => ({
              status: "SUCCESS",
              products: returnedProducts,
            }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: "SUCCESS" }),
        };
      });

      const client = new BaseComClient({
        token: "test_token",
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      const testIds = Array.from({ length: 150 }, (_, i) => 1000 + i);
      const result = await client.getInventoryProductsDataBatched(101, testIds, 100);

      expect(capturedBatches).toHaveLength(2);
      expect(capturedBatches[0]).toHaveLength(100);
      expect(capturedBatches[1]).toHaveLength(50);
      expect(Object.keys(result)).toHaveLength(150);
    });

    it("bezwzględnie blokuje operacje modyfikujące w Base.com", async () => {
      const client = new BaseComClient({ token: "test_token" });
      await expect(client.callMethod("setInventoryProductStock", {})).rejects.toThrow(
        ReadOnlyViolationError
      );
      await expect(client.callMethod("setOrderFields", {})).rejects.toThrow(
        ReadOnlyViolationError
      );
    });
  });

  describe("Customer Data Isolation (Anti-IDOR)", () => {
    it("uniemożliwia użytkownikowi A dostęp do połączeń i skanów użytkownika B", async () => {
      const userA = "usr_tenant_a_123";
      const userB = "usr_tenant_b_456";

      // Create connection for User A
      const connA = await dataStore.createConnection(userA, "Sklep Klienta A", "secret_token_a");
      expect(connA.id).toBeDefined();

      // User A can access their connection
      const fetchedByA = await dataStore.getConnectionById(connA.id, userA);
      expect(fetchedByA).not.toBeNull();
      expect(fetchedByA?.userId).toBe(userA);

      // User B CANNOT access User A's connection (Isolation verified)
      const fetchedByB = await dataStore.getConnectionById(connA.id, userB);
      expect(fetchedByB).toBeNull();
    });
  });

  describe("Authoritative Inventory Discrepancy Checks", () => {
    it("zgłasza niespójność sumy stanów TYLKO gdy zdefiniowano co najmniej 2 magazyny składowe", () => {
      const productItem: BaseLinkerProductListItem = {
        id: 777,
        sku: "TEST-DESYNC",
        ean: "5901234123457",
        name: "Produkt Magazynowy",
        quantity: 10,
        price_brutto: 99.0,
      };

      // Case 1: Product with 2 warehouses whose sum (7) does not match total quantity (10)
      const multiWarehouseData: Record<string, BaseLinkerProductData> = {
        "777": {
          is_bundle: false,
          ean: "5901234123457",
          sku: "TEST-DESYNC",
          tax_rate: 23,
          weight: 1.0,
          height: 10,
          width: 10,
          length: 10,
          star: 0,
          category_id: 1,
          producer_id: 1,
          prices: {},
          stock: { wh_main: 4, wh_secondary: 3 }, // Sum is 7 != 10
          text_fields: { name: "Produkt Magazynowy" },
          images: {},
        },
      };

      const issuesMulti = diagnoseInventory([productItem], multiWarehouseData);
      const desyncIssue = issuesMulti.find((i) => i.code === "INV_WAREHOUSE_DESYNC");
      expect(desyncIssue).toBeDefined();
      expect(desyncIssue?.severity).toBe("WARNING");

      // Case 2: Product with only 1 warehouse defined - not an authoritative multi-warehouse breakdown
      const singleWarehouseData: Record<string, BaseLinkerProductData> = {
        "777": {
          ...multiWarehouseData["777"],
          stock: { wh_main: 7 }, // Only 1 warehouse entry, no authoritative multi-location breakdown
        },
      };

      const issuesSingle = diagnoseInventory([productItem], singleWarehouseData);
      const desyncSingle = issuesSingle.find((i) => i.code === "INV_WAREHOUSE_DESYNC");
      expect(desyncSingle).toBeUndefined(); // Must NOT raise false positive
    });
  });

  describe("EAN Validation Utility", () => {
    it("prawidłowo weryfikuje długości i formaty kodów kreskowych", () => {
      expect(isValidEan("5901234123457")).toBe(true); // 13 digits
      expect(isValidEan("12345678")).toBe(true); // 8 digits
      expect(isValidEan("123456789012")).toBe(true); // 12 digits
      expect(isValidEan("12345678901234")).toBe(true); // 14 digits
      expect(isValidEan("123INVALID")).toBe(false); // contains letters
      expect(isValidEan("12345")).toBe(false); // wrong length
      expect(isValidEan("")).toBe(false); // empty
    });
  });

  describe("API Error & Invalid Credential Handling", () => {
    it("poprawnie wyłapuje i rzuca błąd przy nieprawidłowym lub wygasłym tokenie API (ERROR_AUTH)", async () => {
      const mockFetch = vi.fn().mockImplementation(async () => {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            status: "ERROR",
            error_code: "ERROR_AUTH",
            error_message: "Podany token API jest nieprawidłowy lub został unieważniony.",
          }),
        };
      });

      const client = new BaseComClient({
        token: "invalid_expired_token",
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      await expect(client.testConnection()).rejects.toThrow(
        "Base.com API Error [ERROR_AUTH]: Podany token API jest nieprawidłowy lub został unieważniony."
      );
    });
  });

  describe("Commercial Value & Diagnostic Issue Enrichment", () => {
    it("każda zdiagnozowana usterka posiada zdefiniowany wpływ biznesowy (businessImpact) i rozwiązanie (suggestedFix)", () => {
      const productItem: BaseLinkerProductListItem = {
        id: 999,
        sku: "",
        ean: "invalid-ean",
        name: "Produkt z Usterkami",
        quantity: -5,
        price_brutto: 0,
      };

      const productData: Record<string, BaseLinkerProductData> = {
        "999": {
          is_bundle: false,
          ean: "invalid-ean",
          sku: "",
          tax_rate: -1,
          weight: 0,
          height: 0,
          width: 0,
          length: 0,
          star: 0,
          category_id: 1,
          producer_id: 1,
          prices: {},
          stock: { wh_1: -5 },
          text_fields: { name: "Produkt z Usterkami" },
          images: {},
        },
      };

      const invIssues = diagnoseInventory([productItem], productData);
      expect(invIssues.length).toBeGreaterThan(0);

      for (const issue of invIssues) {
        expect(issue.businessImpact).toBeDefined();
        expect(issue.businessImpact.length).toBeGreaterThan(15);
        expect(issue.suggestedFix).toBeDefined();
        expect(issue.suggestedFix.length).toBeGreaterThan(15);
        expect(typeof issue.canAutoFix).toBe("boolean");
      }
    });
  });

  describe("Connection Deletion Security", () => {
    it("pozwala właścicielowi usunąć połączenie i blokuje usunięcie przez innego użytkownika", async () => {
      const ownerId = "usr_owner_11";
      const strangerId = "usr_stranger_22";

      const conn = await dataStore.createConnection(ownerId, "Sklep do usunięcia", "token_delete_test");
      expect(conn.id).toBeDefined();

      // Stranger tries to delete owner's connection
      const strangerDelete = await dataStore.deleteConnection(conn.id, strangerId);
      expect(strangerDelete.count).toBe(0);

      // Verify connection still exists
      const stillThere = await dataStore.getConnectionById(conn.id, ownerId);
      expect(stillThere).not.toBeNull();

      // Owner deletes their own connection
      const ownerDelete = await dataStore.deleteConnection(conn.id, ownerId);
      expect(ownerDelete.count).toBe(1);

      // Verify connection is gone
      const gone = await dataStore.getConnectionById(conn.id, ownerId);
      expect(gone).toBeNull();
    });
  });
});
