import { BaseLinkerProductData, BaseLinkerProductListItem } from "@/types/baselinker";
import { DiagnosticIssueItem } from "@/types";

/**
 * Diagnostic checks for Inventory and Warehouse Stocks.
 */
export function diagnoseInventory(
  productsList: BaseLinkerProductListItem[],
  productsDataMap: Record<string, BaseLinkerProductData>
): DiagnosticIssueItem[] {
  const issues: DiagnosticIssueItem[] = [];

  for (const item of productsList) {
    const pData = productsDataMap[item.id.toString()];
    const productIdStr = item.id.toString();
    const productName = item.name || (pData?.text_fields?.name) || `Produkt #${item.id}`;
    const sku = (item.sku || pData?.sku || "").trim();
    const quantity = item.quantity ?? 0;

    // 1. Negative Stock Detection (CRITICAL)
    if (quantity < 0) {
      issues.push({
        category: "INVENTORY",
        severity: "CRITICAL",
        code: "INV_NEGATIVE_STOCK",
        title: `Ujemny stan magazynowy (${quantity} szt.)`,
        description: `Produkt "${productName}" (SKU: ${sku || "brak"}) ma ujemny stan magazynowy w Base.com: ${quantity} szt.`,
        affectedEntityId: productIdStr,
        affectedIdentifier: sku || `ID: ${item.id}`,
        details: { productId: item.id, quantity, sku },
        suggestedFix:
          "Zbadaj przyczynę ujemnego stanu magazynowego (zdublowane zamówienia, błędny zwrot) i wykonaj dokument korekty magazynowej (PW / RW).",
        businessImpact:
          "Ryzyko oversellingu — sprzedaży towarów, których nie ma na stanie. Prowadzi do opóźnień, reklamacji i utraty punktów jakości w marketplace.",
        canAutoFix: false,
        autoFixNote:
          "Wymaga inwentaryzacji fizycznej i wystawienia dokumentu bilansującego (PW/RW).",
        estimatedFixTime: "~5-10 min na weryfikację fizyczną",
      });
    }

    // 2. Multi-warehouse stocks verification
    if (pData?.stock) {
      const warehouseEntries = Object.entries(pData.stock);
      let sumWarehouseStock = 0;
      let hasNegativeWarehouseStock = false;

      for (const [whId, whQty] of warehouseEntries) {
        sumWarehouseStock += whQty;
        if (whQty < 0) {
          hasNegativeWarehouseStock = true;
          issues.push({
            category: "INVENTORY",
            severity: "CRITICAL",
            code: "INV_WAREHOUSE_NEGATIVE_STOCK",
            title: `Ujemny stan w magazynie [${whId}]`,
            description: `W magazynie o identyfikatorze "${whId}" produkt "${productName}" wykazuje stan ${whQty} szt.`,
            affectedEntityId: productIdStr,
            affectedIdentifier: sku || `ID: ${item.id}`,
            details: { productId: item.id, warehouseId: whId, stock: whQty, sku },
            suggestedFix:
              `Skoryguj stan magazynowy dla magazynu "${whId}" w Base.com.`,
            businessImpact:
              "Błędy przy kompletacji zamówień kierowanych do tego konkretnego magazynu i rozbieżności bilansowe.",
            canAutoFix: false,
            autoFixNote:
              "Wymaga edycji stanu magazynu składowego w panelu BaseLinkera.",
            estimatedFixTime: "~3 min na magazyn",
          });
        }
      }

      // 3. Multi-warehouse stocks desynchronization
      // Checked ONLY when authoritative comparison source is present: at least 2 distinct warehouses defined
      if (
        warehouseEntries.length >= 2 &&
        !hasNegativeWarehouseStock &&
        sumWarehouseStock !== quantity
      ) {
        issues.push({
          category: "INVENTORY",
          severity: "WARNING",
          code: "INV_WAREHOUSE_DESYNC",
          title: "Niespójność sumy stanów z magazynów składowych",
          description: `Suma stanów magazynów składowych (${sumWarehouseStock} szt. z ${warehouseEntries.length} magazynów) różni się od stanu ogólnego produktu (${quantity} szt.) dla "${productName}".`,
          affectedEntityId: productIdStr,
          affectedIdentifier: sku || `ID: ${item.id}`,
          details: {
            productId: item.id,
            sumWarehouseStock,
            totalQuantity: quantity,
            warehouseCount: warehouseEntries.length,
            sku,
          },
          suggestedFix:
            "Wykonaj ponowną synchronizację stanów magazynowych w Base.com lub sprawdź reguły domyślnego magazynu.",
          businessImpact:
            "Kanały sprzedaży mogą pobierać błędną sumaryczną dostępność towaru, zaniżając lub zawyżając potencjał sprzedażowy.",
          canAutoFix: false,
          autoFixNote:
            "Wymaga weryfikacji powiązań magazynów składowych w module 'Magazyn -> Ustawienia'.",
          estimatedFixTime: "~2-5 min",
        });
      }
    }

    // 4. Zero Stock Notice for Active Catalog Items
    if (quantity === 0) {
      issues.push({
        category: "INVENTORY",
        severity: "INFO",
        code: "INV_ZERO_STOCK",
        title: "Zerowy stan magazynowy (0 szt.)",
        description: `Produkt "${productName}" (SKU: ${sku || "brak"}) ma obecnie stan 0 szt. na magazynie.`,
        affectedEntityId: productIdStr,
        affectedIdentifier: sku || `ID: ${item.id}`,
        details: { productId: item.id, sku },
        suggestedFix:
          "Upewnij się, że oferty w marketplace (Allegro, eBay) zostały automatycznie wygaszone lub uzupełnij dostawę towaru.",
        businessImpact:
          "Utrata potencjalnych przychodów ze sprzedaży; ryzyko zakupu z zerowego stanu, jeśli automatyczne zamykanie aukcji zawiedzie.",
        canAutoFix: false,
        autoFixNote:
          "Możliwe zabezpieczenie przez regułę automatyczną w BaseLinkerze (zamykanie aukcji przy stanie <= 0).",
      });
    }
  }

  return issues;
}
