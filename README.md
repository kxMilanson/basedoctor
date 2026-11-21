# BaseDoctor — System Diagnostyki Sklepów E-Commerce dla Base.com

BaseDoctor to zaawansowana, produkcyjna platforma SaaS klasy Diagnostic Engine dla sklepów internetowych korzystających z platformy **Base.com (dawniej BaseLinker)**.

Aplikacja przeprowadza kompleksowy, automatyczny audyt integralności bazy danych w trzech kluczowych filarach: **Katalog Produktów i kody SKU/EAN**, **Spójność Magazynowa i Stany Towarów** oraz **Płatności, Realizacja i Anomalie Zamówień**.

---

## 🌟 Kluczowe Funkcjonalności

1. **Bezpieczna Rejestracja i Logowanie** — Haszowanie haseł algorytmem bcrypt (salt 10), sesje HTTP-only JWT (algorytm HS256) oraz role użytkowników (`USER` i `ADMIN`).
2. **Szyfrowanie Poświadczeń AES-256-GCM** — Tokeny API Base.com (`X-BLToken`) są natychmiast szyfrowane symetrycznie przy użyciu AES-256-GCM z unikalnym wektorem inicjalizacyjnym (IV) i tagiem autentykacyjnym (Auth Tag) zapobiegającym manipulacji w bazie. Tokeny nigdy nie trafiają do klienta w otwartym tekście.
3. **Ścisły Tryb Tylko do Odczytu (Read-Only Enforcement)** — Klient API `BaseComClient` wymusza białą listę dozwolonych metod i rzuca natychmiastowy wyjątek przy jakiejkolwiek próbie wywołania metod modyfikujących (`set*`, `add*`, `delete*`).
4. **Zgodność z Limitami Zapytań (Rate Limiting)** — Wbudowany mechanizm sliding-window pilnuje oficjalnego limitu Base.com (100 req/min), z automatycznym retry i exponential backoff dla kodów HTTP 429.
5. **Diagnostyka Produktów i Kodów SKU** — Identyfikacja brakujących SKU, zduplikowanych SKU w katalogu, brakujących lub nieprawidłowych kodów EAN-13, brakującej wagi produktu (0.00 kg - generującej błędy u kurierów), brakujących zdjęć oraz cen zerowych / ujemnych (0 PLN).
6. **Wykrywanie Niespójności Magazynowych** — Wykrywanie ujemnych stanów magazynowych, ujemnych stanów w poszczególnych magazynach składowych, rozbieżności pomiędzy sumą stanów w magazynach a stanem łącznym oraz ostrzeżenia o zerowym zapasie.
7. **Detekcja Anomalii Zamówień i Ryzyka Finansowego** — Wykrywanie zamówień zablokowanych w realizacji (&gt; 7 dni oraz &gt; 14 dni), opłaconych zamówień bez nadania przesyłki (&gt; 72h), zamówień oznaczonych jako wysłane bez numeru listu przewozowego, niedopłat oraz krytycznych sytuacji wysyłki towaru bez odnotowanej zapłaty (nie za pobraniem).
8. **Generowanie Raportów z Eksportem do PDF** — Profesjonalne raporty audytowe generowane w czasie rzeczywistym do formatu PDF z punktacją Health Score, podsumowaniem modułów i szczegółową listą zaleceń naprawczych.
9. **Historia Skanów Diagnostycznych** — Archiwizacja wszystkich audytów z możliwością śledzenia trendu poprawy jakości danych sklepu.
10. **Panel Zarządczy Administratora** — Statystyki platformy, audyt rejestracji, monitor połączonych sklepów i globalny rejestr wykrytych anomalii.
11. **Responsywny Interfejs w Języku Polskim** — Dopracowany interfejs w Tailwind CSS, zaprojektowany z myślą o polskich menedżerach e-commerce i agencjach marketingowo-wdrożeniowych.

---

## 🛠 Stos Technologiczny

- **Framework**: Next.js 14 (App Router)
- **Język**: TypeScript
- **Baza Danych**: PostgreSQL + Prisma ORM
- **Szyfrowanie**: Node.js Native Crypto (AES-256-GCM) + bcryptjs
- **Autentykacja**: JOSE (JWT Signed Cookies)
- **Styling**: Tailwind CSS + Lucide Icons
- **Generowanie PDF**: PDFKit
- **Testy Automatyczne**: Vitest

---

## 📐 Architektura i Przepływ Danych

```text
[Użytkownik / Przeglądarka]
         │ (HTTPS / Session Cookie)
         ▼
[Next.js App Router (Pulpit / Raporty)]
         │
[API Route Handler (/api/connections/[id]/scan)]
         │
 ┌───────┴──────────────────────────────┐
 │ Usługa Diagnostyczna                 │
 │ 1. Pobranie zaszyfrowanego tokena     │
 │ 2. Odszyfrowanie AES-256-GCM          │
 │ 3. Inicjalizacja BaseComClient       │
 └───────┬──────────────────────────────┘
         │
         │ (HTTP POST - connector.php + X-BLToken)
         │ *Strict Read-Only Enforcement*
         ▼
[Oficjalne API Base.com (api.baselinker.com)]
   ├── getInventories
   ├── getInventoryProductsList
   ├── getInventoryProductsData
   ├── getOrderStatusList
   └── getOrders
         │
         ▼ (JSON Response)
[Deterministyczny Silnik Reguł (Diagnostic Engine)]
   ├── diagnoseProducts()
   ├── diagnoseInventory()
   └── diagnoseOrders()
         │
         ▼ (Strukturalny Raport + Health Score 0-100%)
 ┌───────┴──────────────────────────────┐
 │ Zapis w PostgreSQL (Prisma)          │
 │ + Generowanie Eksportu PDF (PDFKit)  │
 └──────────────────────────────────────┘
```

---

## 🚀 Instrukcja Instalacji i Uruchomienia

### Wymagania:
- Node.js 18+ (zalecany Node.js 20+)
- Baza danych PostgreSQL (lub Supabase / Neon / Docker)

### 1. Klonowanie i instalacja zależności
```bash
git clone <repo-url>
cd basedoctor
npm install
```

### 2. Konfiguracja zmiennych środowiskowych
Skopiuj plik `.env.example` do `.env`:
```bash
cp .env.example .env
```

Uzupełnij zmienne:
```env
# Połączenie z bazą PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/basedoctor?schema=public"

# Tajny klucz do podpisywania tokenów sesyjnych JWT (min. 32 znaki)
JWT_SECRET="twoj_bardzo_bezpieczny_sekret_jwt_minimum_32_znaki_dlugosci!"

# Klucz szyfrowania AES-256-GCM dla tokenów Base.com (dokładnie 64 znaki hex lub 32 bajty)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Port i URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="production"
```

Możesz wygenerować nowy bezpieczny `ENCRYPTION_KEY` poleceniem:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Migracja bazy danych
```bash
npx prisma generate
npx prisma db push
```

### 4. Uruchomienie testów automatycznych
```bash
npm run test
```

### 5. Budowanie i start aplikacji produkcyjnej
```bash
npm run build
npm run start
```
Aplikacja będzie dostępna pod adresem: `http://localhost:3000`.

---

## 🔑 Domyślne Konta Demonstracyjne

Aplikacja zawiera wbudowane konta demonstracyjne do natychmiastowych testów funkcjonalnych:

| Rola | E-mail | Hasło | Opis |
|---|---|---|---|
| **Administrator** | `admin@basedoctor.pl` | `Admin123!` | Pełny dostęp do Panelu Admina, statystyk globalnych i bazy użytkowników. |
| **Właściciel Sklepu** | `jan@twojsklep.pl` | `User123!` | Gotowe podłączenie sklepu demonstracyjnego z próbką danych anomalii. |

Możesz również zarejestrować nowe konto i podłączyć własny token ze swojego konta BaseLinker.

---

## 📑 Zakres Diagnostyki i Jasno Udokumentowane Ograniczenia

### Obsługiwane testy (MVP):
- **PROD_MISSING_SKU**: Wykrywanie produktów bez kodu SKU.
- **PROD_DUPLICATE_SKU**: Wykrywanie zduplikowanych kodów SKU w katalogu.
- **PROD_MISSING_EAN** & **PROD_INVALID_EAN**: Weryfikacja obecności i formatu kodu kreskowego EAN-8/13/14.
- **PROD_DUPLICATE_EAN**: Wykrywanie tego samego kodu EAN w wielu ofertach.
- **PROD_ZERO_PRICE**: Alarm w przypadku ceny brutto &le; 0 PLN.
- **PROD_MISSING_WEIGHT**: Ostrzeżenie o braku wagi produktu (0.00 kg - błędy etykiet kurierskich).
- **PROD_MISSING_IMAGES**: Brak zdjęć w galerii Base.com.
- **PROD_INVALID_TAX**: Nieprawidłowa stawka VAT.
- **INV_NEGATIVE_STOCK**: Wykrywanie ujemnych stanów magazynowych (overselling).
- **INV_WAREHOUSE_DESYNC**: Niespójność sumy stanów z magazynów składowych z łączną ilością.
- **INV_ZERO_STOCK**: Wykrywanie zerowych stanów towarów w aktywnym katalogu.
- **ORD_STUCK_PROCESSING**: Zamówienia zablokowane w realizacji pow. 7 oraz 14 dni.
- **ORD_PAID_UNSHIPPED**: Zamówienia w 100% opłacone bez nadania przesyłki pow. 72h.
- **ORD_MISSING_TRACKING**: Zamówienia wysłane bez numeru listu przewozowego.
- **ORD_UNPAID_SHIPPED**: Zamówienia wysłane bez wpłaty (nie za pobraniem) - ryzyko wyłudzenia.
- **ORD_PARTIAL_PAYMENT**: Niedopłaty w zamówieniach przelewowych.

### Granice systemu (Niewspierane operacje):
1. **Zapis i modyfikacja w Base.com**: BaseDoctor celowo nie oferuje żadnych operacji zapisu (zasada bezpieczeństwa Read-Only).
2. **Bezpośrednie webhooki przewoźników (np. InPost API, DPD API)**: Diagnozowane są dane zapisane w bazie Base.com (`delivery_package_nr`).
3. **Koszty zakupu i marża ERP**: Weryfikacja kosztów zakupu z programów magazynowych (Subiekt, Symfonia, Comarch Optima) wymaga dedykowanych konektorów ERP i wykracza poza zakres MVP API Base.com.
