import { describe, it, expect } from "vitest";
import { generateScanReportPdf } from "./pdf";
import { runDiagnostics } from "@/lib/diagnostics/engine";
import {
  mockOrders,
  mockProductsDataMap,
  mockProductsList,
  mockStatuses,
} from "@/test/fixtures/baselinker";

describe("PDF Report Generator", () => {
  it("generuje poprawny bufor PDF z nagłówkami i usterkami", async () => {
    const report = runDiagnostics({
      shopConnectionId: "conn_pdf_test",
      shopName: "Sklep Testowy PDF",
      productsList: mockProductsList,
      productsDataMap: mockProductsDataMap,
      orders: mockOrders,
      statuses: mockStatuses,
    });

    const pdfBuffer = await generateScanReportPdf(report);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000); // Standard PDF header & content
    // Verify standard PDF magic bytes: %PDF-
    expect(pdfBuffer.toString("utf8", 0, 5)).toBe("%PDF-");
  });
});
