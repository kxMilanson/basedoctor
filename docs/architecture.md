# BaseDoctor — Architektura i Zasady Bezpieczeństwa

## 1. Wprowadzenie i Cel Systemu
BaseDoctor to specjalistyczna platforma SaaS klasy Enterprise Diagnostic dla sklepów internetowych i zespołów e-commerce zintegrowanych z platformą **Base.com (dawniej BaseLinker)**. 

Głównym celem systemu jest ciągłe, deterministyczne wykrywanie anomalii w bazie danych produktów, magazynu i zamówień, zanim spowodują one:
- Stracone zamówienia i spadek konwersji w marketplace (Allegro, Amazon, Erli).
- Straty finansowe (sprzedaż towarów za 0 PLN, nieopłacone wysyłki).
- Dopłaty logistyczne i opóźnienia u kurierów (brak wagi brutto paczki).
- Blokady kont sprzedawcy za brak numerów listów przewozowych w SLA.

---

## 2. Architektura Bezpieczeństwa (Security Architecture)

### 2.1 Zasada Strict Read-Only (Tylko do Odczytu)
System BaseDoctor został zaprojektowany z bezwzględną zasadą nietykalności danych w systemie źródłowym sklepu.
- W warstwie klienta `BaseComClient` zaimplementowano ścisłą **białą listę dozwolonych metod** (`ALLOWED_READ_ONLY_METHODS`).
- Wszelkie metody wprowadzające zmiany (np. `addOrder`, `setOrderFields`, `setInventoryProductStock`, `deleteProduct`) są natychmiast blokowane na poziomie kodu przed wysłaniem żądania i rzucają wyjątek `ReadOnlyViolationError`.
- Wyklucza to jakiekolwiek ryzyko przypadkowego nadpisania danych klienta.

### 2.2 Szyfrowanie Poświadczeń (AES-256-GCM)
Tokeny dostępowe API Base.com (`X-BLToken`) są krytycznymi danymi uwierzytelniającymi:
- Nigdy nie są zapisywane w bazie danych w postaci otwartego tekstu (plaintext).
- Każdy token jest szyfrowany algorytmem **AES-256-GCM** przy użyciu 32-bajtowego klucza głównego serwera (`ENCRYPTION_KEY`).
- Dla każdego rekordu generowany jest kryptograficznie silny, losowy 96-bitowy wektor inicjalizacyjny (IV: `crypto.randomBytes(12)`).
- Wyliczany jest 128-bitowy tag uwierzytelniający (Auth Tag), który gwarantuje integralność danych i natychmiast wykrywa próby manipulacji w bazie.
- W interfejsie użytkownika token jest zawsze zamaskowany (np. `1234••••••••abcd`).

### 2.3 Kontrola Limitów Zapytań (Rate Limiting)
- Oficjalny limit Base.com wynosi **100 zapytań na minutę** na dany token.
- Wbudowany algorytm sliding-window rate limiter z bezpiecznym progiem 95 zapytań/min wstrzymuje żądania, zapobiegając blokadzie IP.
- W przypadku otrzymania nagłówka HTTP 429 Too Many Requests, klient wykonuje automatyczny exponential backoff i ponawia zapytanie do 3 razy.

---

## 3. Silnik Diagnostyczny i Deterministyczne Reguły

BaseDoctor nie stosuje niedeterministycznych heurystyk; każda usterka podlega ścisłej walidacji biznesowej:

| Kod Usterki | Kategoria | Poziom | Opis i Wpływ Biznesowy | Sugerowane Działanie |
|---|---|---|---|---|
| `PROD_MISSING_SKU` | PRODUCT | CRITICAL | Brak kodu SKU towaru/wariantu. Blokuje integrację z ERP i marketplace. | Nadaj unikalny kod SKU w katalogu Base.com. |
| `PROD_DUPLICATE_SKU` | PRODUCT | CRITICAL | Identyczny SKU przypisany do wielu produktów. Ryzyko wysłania złego towaru. | Zróżnicuj kody SKU dla każdego wariantu. |
| `PROD_ZERO_PRICE` | PRICING | CRITICAL | Cena brutto <= 0 PLN. Ryzyko darmowej sprzedaży. | Zaktualizuj cennik lub wstrzymaj publikację. |
| `PROD_MISSING_EAN` | PRODUCT | WARNING | Brak kodu kreskowego EAN. Odrzucenie ofert przez Allegro/Google. | Wprowadź prawidłowy kod EAN-13. |
| `PROD_INVALID_EAN` | PRODUCT | WARNING | Format EAN inny niż 8, 12, 13, 14 cyfr lub zawiera litery. | Skoryguj cyfry kodu kreskowego. |
| `PROD_MISSING_WEIGHT`| PRODUCT | WARNING | Waga wynosi 0.00 kg. Błędy i kary gabarytowe u kurierów (InPost/DPD). | Uzupełnij wagę brutto w kg. |
| `PROD_MISSING_IMAGES`| PRODUCT | WARNING | Brak zdjęć w galerii Base.com. | Wgraj zdjęcia produktu. |
| `INV_NEGATIVE_STOCK` | INVENTORY | CRITICAL | Ujemny stan magazynowy (np. -5 szt.). Overselling. | Wystaw dokument korygujący (PW/RW). |
| `INV_WAREHOUSE_DESYNC`| INVENTORY | WARNING | Suma stanów magazynów różni się od stanu łącznego. | Wykonaj ponowną synchronizację stanów. |
| `INV_ZERO_STOCK` | INVENTORY | INFO | Stan 0 szt. w aktywnym katalogu. | Zamów dostawę lub wstrzymaj ofertę. |
| `ORD_STUCK_PROCESSING_CRITICAL` | ORDER | CRITICAL | Zamówienie w realizacji ponad 14 dni bez finalizacji. | Zweryfikuj stan realizacji z magazynem. |
| `ORD_MISSING_TRACKING` | SHIPPING | CRITICAL | Zamówienie oznaczone jako wysłane, lecz brak numeru przesyłki. | Uzupełnij numer listu przewozowego. |
| `ORD_UNPAID_SHIPPED` | ORDER | CRITICAL | Wysłano zamówienie bez wpłaty (i nie za pobraniem). Strata gotówki! | Pilnie sprawdź księgowanie wpłaty. |
| `ORD_PAID_UNSHIPPED` | ORDER | WARNING | Opłacone zamówienie leży > 72h bez nadania paczki. | Wygeneruj etykietę i przekaż kurierowi. |
| `ORD_PARTIAL_PAYMENT`| ORDER | WARNING | Wpłacono kwotę mniejszą niż wartość zamówienia. | Wezwij klienta do dopłaty różnicy. |

---

## 4. Wskaźnik Kondycji Sklepu (Health Score)

Health Score (0-100%) jest ważoną miarą integralności bazy sklepu:
- **Katalog i SKU**: waga 35%
- **Stany magazynowe**: waga 30%
- **Zamówienia i płatności**: waga 35%

Kary za usterki:
- Błąd krytyczny (CRITICAL): -12 pkt w module
- Ostrzeżenie (WARNING): -4 pkt w module
- Informacja (INFO): -1 pkt w module

---

## 5. Granice Systemu (Jasno udokumentowane ograniczenia)
1. **Brak operacji zapisu w Base.com**: BaseDoctor diagnozuje i raportuje; nie nadpisuje stanów ani statusów.
2. **Brak bezpośrednich webhooków kurierów**: Analiza opiera się na danych wprowadzonych do bazy Base.com (`delivery_package_nr`).
3. **ERP w czasie rzeczywistym**: Ceny zakupu i stany magazynowe w programach ERP (Subiekt GT/Nexo, Optima) nie są odpytywane bezpośrednio bez pośrednictwa Base.com.
