"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Lock, ShieldCheck, Wrench, X } from "lucide-react";

export interface FixSuggestion {
  fieldName: string;
  oldValue: string;
  suggestedValue: string;
  explanation: string;
}

export function getFixSuggestionForIssue(issue: any): FixSuggestion | null {
  const code = issue.code || "";
  if (code.includes("NEGATIVE_STOCK") || code.includes("INV_NEGATIVE")) {
    return {
      fieldName: "Stan magazynowy",
      oldValue: issue.affectedIdentifier ? `${issue.affectedIdentifier} (-2 szt.)` : "-2 szt.",
      suggestedValue: "0 szt.",
      explanation:
        "Wyzerowanie ujemnego stanu blokuje sprzedaż towaru, którego nie masz fizycznie na półce.",
    };
  }
  if (code.includes("WAREHOUSE_DESYNC")) {
    return {
      fieldName: "Suma stanów magazynu",
      oldValue: "Rozbieżność magazynów",
      suggestedValue: "Wyrównano do sumy magazynów składowych",
      explanation:
        "Przeliczenie i wyrównanie głównego stanu produktu do rzeczywistej sumy ze wszystkich magazynów.",
    };
  }
  if (code.includes("MISSING_SKU")) {
    const idPart = issue.affectedEntityId || Math.floor(1000 + Math.random() * 9000);
    return {
      fieldName: "Kod produktu (SKU)",
      oldValue: "Brak kodu SKU",
      suggestedValue: `SKU-${idPart}`,
      explanation:
        "Nadanie unikalnego kodu SKU pozwoli poprawnie powiązać produkt z ofertami Allegro i fakturami.",
    };
  }
  if (code.includes("DUPLICATE_SKU")) {
    const baseSku = issue.affectedIdentifier || "SKU-DUPLIKAT";
    return {
      fieldName: "Kod produktu (SKU)",
      oldValue: baseSku,
      suggestedValue: `${baseSku}-V2`,
      explanation:
        "Rozdzielenie zdublowanego kodu SKU zapobiegnie pomyłkom przy pakowaniu zamówień.",
    };
  }
  if (code.includes("MISSING_WEIGHT")) {
    return {
      fieldName: "Waga brutto produktu",
      oldValue: "0.00 kg",
      suggestedValue: "0.50 kg",
      explanation:
        "Wpisanie realnej wagi produktu z opakowaniem uchroni Cię przed dopłatami za weryfikację na sortowni kuriera.",
    };
  }
  if (code.includes("INVALID_TAX") || code.includes("VAT")) {
    return {
      fieldName: "Stawka VAT",
      oldValue: "Nieprawidłowa stawka",
      suggestedValue: "23%",
      explanation:
        "Ustawienie poprawnej stawki VAT zapewni zgodność paragonów, faktur i pliku JPK.",
    };
  }
  if (code.includes("ZERO_PRICE")) {
    return {
      fieldName: "Cena sprzedaży brutto",
      oldValue: "0.00 PLN",
      suggestedValue: "99.00 PLN",
      explanation:
        "Uzupełnienie ceny zabezpieczy sklep przed przypadkową sprzedażą produktu za darmo.",
    };
  }
  if (issue.canAutoFix || issue.category === "PRODUCT" || issue.category === "INVENTORY") {
    return {
      fieldName: "Wartość parametru",
      oldValue: issue.affectedIdentifier || "Wartość wymagająca poprawy",
      suggestedValue: "Poprawiono zgodnie z zaleceniem",
      explanation: issue.suggestedFix || "Bezpieczna aktualizacja parametru po Twoim zatwierdzeniu.",
    };
  }
  return null;
}

interface SafeFixModalProps {
  issue: any;
  suggestion: FixSuggestion;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (newValue: string, fieldName: string, oldValue: string) => void;
}

export function SafeFixModal({
  issue,
  suggestion,
  submitting,
  onClose,
  onConfirm,
}: SafeFixModalProps) {
  const [newValue, setNewValue] = useState(suggestion.suggestedValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    onConfirm(newValue.trim(), suggestion.fieldName, suggestion.oldValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="studio-card max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-modal bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18181B]">
                Asystent Bezpiecznej Naprawy
              </h3>
              <p className="text-xs text-[#71717A]">
                Sprawdź zmianę przed zapisaniem. Zawsze możesz ją cofnąć.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
          <div className="text-xs font-semibold text-[#18181B]">{issue.title}</div>
          <p className="text-xs text-[#52525B]">{suggestion.explanation}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Before -> After Visual Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
            <div className="sm:col-span-5 p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] space-y-1">
              <span className="text-[11px] font-semibold text-[#BE123C] uppercase tracking-wide">
                Przed zmianą
              </span>
              <div className="text-xs font-semibold text-[#18181B] break-words">
                {suggestion.oldValue}
              </div>
            </div>

            <div className="sm:col-span-1 flex justify-center">
              <ArrowRight className="w-4 h-4 text-[#0F766E] rotate-90 sm:rotate-0" />
            </div>

            <div className="sm:col-span-5 p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-1">
              <label
                htmlFor="fix-new-value"
                className="text-[11px] font-semibold text-[#047857] uppercase tracking-wide block"
              >
                Po naprawie ({suggestion.fieldName})
              </label>
              <input
                id="fix-new-value"
                type="text"
                required
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#A7F3D0] text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#52525B] bg-[#F0FDFA] border border-[#CCFBF1] p-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>
              Przed wykonaniem poprawki zapisujemy kopię poprzedniej wartości — przycisk{" "}
              <strong>„Cofnij zmianę”</strong> pozostaje aktywny.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-studio-secondary cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-studio-brand cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Zapisywanie..." : "Zatwierdź naprawę"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
