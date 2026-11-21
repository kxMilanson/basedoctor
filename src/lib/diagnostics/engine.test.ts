import { describe, it, expect } from "vitest";
import { runDiagnostics } from "./engine";
import {
  mockInventories,
  mockOrders,
  mockProductsDataMap,
  mockProductsList,
  mockStatuses,
} from "@/test/fixtures/baselinker";

describe("BaseDoctor Diagnostic Engine", () => {
  it("przeprowadza pełną diagnozę produktów, magazynu i zamówień na realistycznych danych", () => {
    const report = runDiagnostics({
      shopConnectionId: "conn_test_01",
      shopName: "Sklep Testowy Base.com",
      productsList: mockProductsList,
      productsDataMap: mockProductsDataMap,
      orders: mockOrders,
      statuses: mockStatuses,
      referenceTimestampMs: Date.now(),
    });

    expect(report.shopName).toBe("Sklep Testowy Base.com");
    expect(report.productsScanned).toBe(mockProductsList.length);
    expect(report.ordersScanned).toBe(mockOrders.length);
    expect(report.issuesCount).toBeGreaterThan(0);

    // 1. Check Product Diagnostic findings
    const missingSku = report.issues.find((i) => i.code === "PROD_MISSING_SKU");
    expect(missingSku).toBeDefined();
    expect(missingSku?.severity).toBe("CRITICAL");

    const duplicateSku = report.issues.find(
      (i) => i.code === "PROD_DUPLICATE_SKU"
    );
    expect(duplicateSku).toBeDefined();
    expect(duplicateSku?.severity).toBe("CRITICAL");

    const invalidEan = report.issues.find((i) => i.code === "PROD_INVALID_EAN");
    expect(invalidEan).toBeDefined();

    const missingWeight = report.issues.find(
      (i) => i.code === "PROD_MISSING_WEIGHT"
    );
    expect(missingWeight).toBeDefined();

    const zeroPrice = report.issues.find((i) => i.code === "PROD_ZERO_PRICE");
    expect(zeroPrice).toBeDefined();
    expect(zeroPrice?.severity).toBe("CRITICAL");

    // 2. Check Inventory findings
    const negativeStock = report.issues.find(
      (i) => i.code === "INV_NEGATIVE_STOCK"
    );
    expect(negativeStock).toBeDefined();
    expect(negativeStock?.severity).toBe("CRITICAL");

    const warehouseDesync = report.issues.find(
      (i) => i.code === "INV_WAREHOUSE_DESYNC"
    );
    expect(warehouseDesync).toBeDefined();

    // 3. Check Order findings
    const stuckOrder = report.issues.find(
      (i) => i.code === "ORD_STUCK_PROCESSING_CRITICAL"
    );
    expect(stuckOrder).toBeDefined();

    const missingTracking = report.issues.find(
      (i) => i.code === "ORD_MISSING_TRACKING"
    );
    expect(missingTracking).toBeDefined();
    expect(missingTracking?.severity).toBe("CRITICAL");

    const unpaidShipped = report.issues.find(
      (i) => i.code === "ORD_UNPAID_SHIPPED"
    );
    expect(unpaidShipped).toBeDefined();
    expect(unpaidShipped?.severity).toBe("CRITICAL");

    const partialPayment = report.issues.find(
      (i) => i.code === "ORD_PARTIAL_PAYMENT"
    );
    expect(partialPayment).toBeDefined();

    // 4. Score verification
    expect(report.healthScore).toBeGreaterThanOrEqual(0);
    expect(report.healthScore).toBeLessThan(100); // Problems detected, so score < 100
    expect(report.categories).toHaveLength(5);
  });

  it("zwraca 100% Health Score dla bezbłędnego zestawu danych", () => {
    const cleanProducts = [
      {
        id: 9999,
        sku: "PERFECT-01",
        ean: "5901234567890",
        name: "Produkt Idealny",
        quantity: 25,
        price_brutto: 149.99,
      },
    ];
    const cleanProductData = {
      "9999": {
        is_bundle: false,
        ean: "5901234567890",
        sku: "PERFECT-01",
        tax_rate: 23,
        weight: 1.2,
        height: 10,
        width: 10,
        length: 10,
        star: 5,
        category_id: 1,
        producer_id: 1,
        prices: { "1": 149.99 },
        stock: { wh_main: 25 },
        text_fields: { name: "Produkt Idealny" },
        images: { "1": "https://img.example.com/perfect.jpg" },
      },
    };
    const cleanOrders = [
      {
        order_id: 8888,
        order_source: "shop",
        order_source_id: 1,
        order_status_id: 8004,
        date_add: Math.floor(Date.now() / 1000) - 3600,
        confirmed: true,
        currency: "PLN",
        payment_method: "PayU",
        payment_method_cod: false,
        payment_done: 149.99,
        delivery_method: "InPost",
        delivery_price: 0,
        delivery_package_nr: "620100088888888888888888",
        products: [
          {
            product_id: "9999",
            variant_id: 0,
            name: "Produkt Idealny",
            sku: "PERFECT-01",
            ean: "5901234567890",
            price_brutto: 149.99,
            tax_rate: 23,
            quantity: 1,
            weight: 1.2,
          },
        ],
      },
    ];

    const report = runDiagnostics({
      shopConnectionId: "conn_clean",
      shopName: "Wzorcowy Sklep",
      productsList: cleanProducts,
      productsDataMap: cleanProductData,
      orders: cleanOrders,
      statuses: mockStatuses,
    });

    expect(report.issuesCount).toBe(0);
    expect(report.healthScore).toBe(100);
  });
});
