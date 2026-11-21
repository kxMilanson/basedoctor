# BaseDoctor — Beta Customer Readiness Checklist

**Version:** 1.0.0-beta  
**Date:** 2026-11-21  
**Target:** First Real Paying Beta Customers / Pilot E-commerce Stores

---

## 1. Beta Release Overview

BaseDoctor is prepared for onboarding its first cohort of beta customers (online stores using Base.com / BaseLinker with 500 – 10 000+ orders/month, as well as BaseLinker integration agencies).

---

## 2. Customer Journey Verification Checklist

| Step | User Action | System Behavior | Status |
|---|---|---|---|
| **1. Rejestracja** | Użytkownik zakłada konto (`/register`). | Hasło hashowane bcryptem (cost 10), unikalny e-mail, sesja JWT w cookie `HttpOnly`. | **PASSED** |
| **2. Logowanie** | Logowanie do systemu (`/login`). | Uwierzytelnienie sesji, ochrona tras przez Edge Middleware (`src/middleware.ts`). | **PASSED** |
| **3. Podłączenie API** | Wprowadzenie tokenu w panelu (`/connections`). | Szyfrowanie AES-256-GCM z losowym wektorem IV, test połączenia z Base.com API, maskowanie tokenu. | **PASSED** |
| **4. Tryb Demo** | 1-kliknięcie "Wypróbuj w trybie demonstracyjnym". | Utworzenie konta demonstracyjnego z etykietą `TRYB DEMO (Dane syntetyczne)` bez potrzeby podawania klucza. | **PASSED** |
| **5. Uruchomienie Audytu** | Kliknięcie "Uruchom Skan" lub audyt z pulpitu. | Pobranie danych przez klienta read-only z obsługą paginacji i rate-limitingu (95 req/min), wykonanie 15 reguł. | **PASSED** |
| **6. Health Score & Grupowanie** | Przegląd pulpitu (`/dashboard`) i raportu (`/scans/[id]`). | Punktacja 0-100%, podział na kategorie (Produkt, Magazyn, Zamówienia) oraz wagi (Krytyczny, Ostrzeżenie, Info). | **PASSED** |
| **7. Wartość Biznesowa** | Inspekcja konkretnej usterki. | Precyzyjny opis problemu, konsekwencje biznesowe, rekomendowane rozwiązanie, możliwość auto-naprawy oraz estymacja czasu ręcznej naprawy. | **PASSED** |
| **8. Eksport PDF** | Kliknięcie "Pobierz Raport PDF". | Generowanie estetycznego, oficjalnego dokumentu A4 PDF z oznaczeniem źródła danych (`BASE_COM_LIVE` vs `DEMO_FIXTURES`). | **PASSED** |
| **9. Historia Audytów** | Wejście w `/scans`. | Pełne archiwum historycznych skanów powiązane z kontem danego klienta, izolacja przed innymi użytkownikami. | **PASSED** |
| **10. Lead Formularz** | Zgłoszenie zapotrzebowania na landing page (`/#kontakt`). | Walidacja danych, przyjęcie leadu i potwierdzenie przyjęcia zapytania w ciągu 24h. | **PASSED** |

---

## 3. Security & Safety Controls

- [x] **100% Read-Only:** Biała lista metod w `BaseComClient`. Brak metod modyfikujących (`set*`, `add*`, `delete*`).
- [x] **Szyfrowanie AES-256-GCM:** Tokeny klientów nigdy nie są przechowywane otwartym tekstem.
- [x] **Zero Ekspozycji Tokenów:** W odpowiedziach API i widokach UI zwracane są wyłącznie maskowane identyfikatory (np. `1000••••••••abcd`).
- [x] **Izolacja Danych (Anti-IDOR):** Każde zapytanie o połączenie lub skan jest weryfikowane pod kątem `userId` zalogowanego użytkownika.
- [x] **Rate Limiting:** Klient API zachowuje margines bezpieczeństwa (max 95 req/min) z 3-etapowym backoffem, chroniąc konto klienta przed blokadą Base.com.
- [x] **Separacja Demo:** Sklepy i skany demo są jaskrawo oznaczone etykietami `TRYB DEMO (Dane syntetyczne)` i nigdy nie są mylone z realnym sklepem.

---

## 4. Pilot Onboarding Protocol (Dla Pierwszych 5 Klientów Beta)

1. **Przygotowanie środowiska:**
   - Klient generuje w BaseLinkerze profil API z uprawnieniami **tylko do odczytu** (odczyt katalogu i odczyt zamówień).
2. **Pierwszy audyt wprowadzający:**
   - Wygenerowanie raportu diagnostycznego BaseDoctor w obecności klienta (lub przesłanie raportu PDF).
   - Omówienie wykrytych usterek krytycznych (np. zdublowane SKU, ujemne stany magazynowe, brak numeru listu przewozowego).
3. **Zbieranie informacji zwrotnej (Feedback Loop):**
   - Czy rekomendacje naprawy były w 100% zrozumiałe dla personelu magazynu / sklepu?
   - Jakie dodatkowe integracje marketplace (Allegro, Amazon, Erli) są priorytetem dla klienta?
   - Czy raport PDF był wystarczająco czytelny dla zarządu firmy?

---

## 5. Gotowość Techniczna (Technical Verification)

- **Testy jednostkowe i integracyjne:** 100% PASS (wszystkie scenariusze testowe zielone).
- **TypeScript & Lint:** Brak błędów kompilacji.
- **Next.js Production Build:** `npm run build` zakończone sukcesem (kod wyjścia 0).
- **Fallback Bazy Danych:** Samonaprawialny magazyn pamięciowy w przypadku braku połączenia z bazą PostgreSQL podczas prezentacji offline.
