import { BaseLinkerProductData, BaseLinkerProductListItem } from "@/types/baselinker";
import { DiagnosticIssueItem } from "@/types";

/**
 * Validates EAN barcode (EAN-8, EAN-13, EAN-14, UPC-12).
 */
export function isValidEan(ean: string): boolean {
  if (!ean) return false;
  const clean = ean.trim();
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(clean)) {
    return false;
  }
  return true;
}

/**
 * Diagnostic checks for Products and SKUs.
 */
export function diagnoseProducts(
  productsList: BaseLinkerProductListItem[],
  productsDataMap: Record<string, BaseLinkerProductData>
): DiagnosticIssueItem[] {
  const issues: DiagnosticIssueItem[] = [];

  const skuOccurrences = new Map<string, Array<{ id: number; name: string }>>();
  const eanOccurrences = new Map<string, Array<{ id: number; name: string }>>();

  for (const item of productsList) {
    const pData = productsDataMap[item.id.toString()];
    const productIdStr = item.id.toString();
    const productName = item.name || (pData?.text_fields?.name) || `Produkt #${item.id}`;
    const sku = (item.sku || pData?.sku || "").trim();
    const ean = (item.ean || pData?.ean || "").trim();

    // 1. Missing SKU Check
    if (!sku) {
      issues.push({
        category: "PRODUCT",
        severity: "CRITICAL",
        code: "PROD_MISSING_SKU",
        title: "Brakujący kod SKU produktu",
        description: `Produkt "${productName}" (ID: ${item.id}) nie posiada zdefiniowanego unikalnego kodu SKU.`,
        affectedEntityId: productIdStr,
        affectedIdentifier: `ID: ${item.id}`,
        details: { productId: item.id, name: productName },
        suggestedFix:
          "Nadaj unikalny kod SKU w katalogu Base.com, aby umożliwić bezbłędną synchronizację z Allegro, Amazon i systemem ERP.",
      });
    } else {
      const list = skuOccurrences.get(sku.toUpperCase()) || [];
      list.push({ id: item.id, name: productName });
      skuOccurrences.set(sku.toUpperCase(), list);
    }

    // 2. Missing or Invalid EAN
    if (!ean) {
      issues.push({
        category: "PRODUCT",
        severity: "WARNING",
        code: "PROD_MISSING_EAN",
        title: "Brakujący kod kreskowy EAN",
        description: `Produkt "${productName}" (SKU: ${sku || "brak"}) nie posiada uzupełnionego kodu EAN.`,
        affectedEntityId: productIdStr,
        affectedIdentifier: sku || `ID: ${item.id}`,
        details: { productId: item.id, sku },
        suggestedFix:
          "Wprowadź prawidłowy kod EAN-13. Większość platform (np. Allegro, Google Shopping) odrzuca lub obniża widoczność ofert bez EAN.",
      });
    } else if (!isValidEan(ean)) {
      issues.push({
        category: "PRODUCT",
        severity: "WARNING",
        code: "PROD_INVALID_EAN",
        title: "Nieprawidłowy format kodu EAN",
        description: `Kod EAN "${ean}" dla produktu "${productName}" nie jest poprawnym kodem EAN-8/13/14.`,
        affectedEntityId: productIdStr,
        affectedIdentifier: sku || `ID: ${item.id}`,
        details: { productId: item.id, ean, sku },
        suggestedFix:
          "Skoryguj kod kreskowy, usuwając litery, spacje lub niepoprawną liczbę cyfr.",
      });
    } else {
      const list = eanOccurrences.get(ean) || [];
      list.push({ id: item.id, name: productName });
      eanOccurrences.set(ean, list);
    }

    // 3. Price Checks
    const price = item.price_brutto ?? 0;
    if (price <= 0) {
      issues.push({
        category: "PRICING",
        severity: "CRITICAL",
        code: "PROD_ZERO_PRICE",
        title: "Cena brutto wynosi 0 PLN lub jest ujemna",
        description: `Produkt "${productName}" ma ustawioną cenę ${price} PLN! Ryzyko sprzedaży za 0 zł.`,
        affectedEntityId: productIdStr,
        affectedIdentifier: sku || `ID: ${item.id}`,
        details: { productId: item.id, price, sku },
        suggestedFix:
          "Natychmiast zaktualizuj cenę sprzedaży produktu w katalogu Base.com lub zablokuj jego wystawianie na kanałach sprzedaży.",
      });
    }

    // Checks using detailed product data if available
    if (pData) {
      // 4. Weight check (Critical for courier logistics)
      const weight = pData.weight ?? 0;
      if (weight <= 0) {
        issues.push({
          category: "PRODUCT",
          severity: "WARNING",
          code: "PROD_MISSING_WEIGHT",
          title: "Brak zdefiniowanej wagi produktu (0.00 kg)",
          description: `Produkt "${productName}" ma wagę 0 kg. Może to spowodować błąd lub wysokie dopłaty gabarytowe u kuriera (InPost, DPD, DHL).`,
          affectedEntityId: productIdStr,
          affectedIdentifier: sku || `ID: ${item.id}`,
          details: { productId: item.id, weight, sku },
          suggestedFix:
            "Uzupełnij wagę brutto produktu w kilogramach w zakładce Parametry produktu.",
        });
      }

      // 5. Images check
      const imageCount = Object.keys(pData.images || {}).length;
      if (imageCount === 0) {
        issues.push({
          category: "PRODUCT",
          severity: "WARNING",
          code: "PROD_MISSING_IMAGES",
          title: "Brak zdjęć produktu",
          description: `Produkt "${productName}" nie ma przypisanego żadnego zdjęcia w galerii Base.com.`,
          affectedEntityId: productIdStr,
          affectedIdentifier: sku || `ID: ${item.id}`,
          details: { productId: item.id, sku },
          suggestedFix:
            "Wgraj minimum jedno zdjęcie produktu wysokiej jakości.",
        });
      }

      // 6. Tax Rate check
      if (pData.tax_rate === undefined || pData.tax_rate === null || pData.tax_rate < 0) {
        issues.push({
          category: "PRICING",
          severity: "WARNING",
          code: "PROD_INVALID_TAX",
          title: "Błędna lub nieokreślona stawka VAT",
          description: `Produkt "${productName}" ma nieprawidłową stawkę podatku VAT (${pData.tax_rate}%).`,
          affectedEntityId: productIdStr,
          affectedIdentifier: sku || `ID: ${item.id}`,
          details: { productId: item.id, taxRate: pData.tax_rate, sku },
          suggestedFix:
            "Przypisz właściwą stawkę podatku VAT (np. 23%, 8%, 5% lub 0%).",
        });
      }
    }
  }

  // 7. Duplicate SKU Check
  for (const [sku, items] of Array.from(skuOccurrences.entries())) {
    if (items.length > 1) {
      issues.push({
        category: "PRODUCT",
        severity: "CRITICAL",
        code: "PROD_DUPLICATE_SKU",
        title: `Zduplikowany kod SKU: "${sku}"`,
        description: `Ten sam kod SKU (${sku}) został przypisany do ${items.length} różnych produktów: ${items.map((i) => `"${i.name}" (ID: ${i.id})`).join(", ")}.`,
        affectedIdentifier: sku,
        details: { sku, occurrences: items },
        suggestedFix:
          "Zmień kody SKU, aby każdy produkt i wariant posiadał ściśle unikalny identyfikator towaru.",
      });
    }
  }

  // 8. Duplicate EAN Check
  for (const [ean, items] of Array.from(eanOccurrences.entries())) {
    if (items.length > 1) {
      issues.push({
        category: "PRODUCT",
        severity: "WARNING",
        code: "PROD_DUPLICATE_EAN",
        title: `Zduplikowany kod EAN: "${ean}"`,
        description: `Ten sam kod kreskowy EAN (${ean}) występuje w ${items.length} produktach: ${items.map((i) => `"${i.name}"`).join(", ")}.`,
        affectedIdentifier: ean,
        details: { ean, occurrences: items },
        suggestedFix:
          "Upewnij się, że nie jest to pomyłka przy wprowadzaniu kodów producenta. Zduplikowany EAN myli skanery na pakowalni.",
      });
    }
  }

  return issues;
}
