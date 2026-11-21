# BaseDoctor Design System — "Precision Commerce Intelligence"

**Version:** 2.4 (`PCI-2.4`)  
**Reference Implementation:** `src/app/dashboard/page.tsx` & `src/components/AppSidebar.tsx`  
**Target Aesthetic:** Linear (visual discipline), Vercel (typographic rigor), Stripe Dashboard (high-density business telemetry).

---

## 1. Design Philosophy

BaseDoctor is a mission-critical diagnostic instrument for e-commerce operators and Base.com agencies. The interface rejects decorative AI-dashboard tropes (no purple gradients, no glassmorphism, no bubbly `24px` corners) in favor of **"Precision Commerce Intelligence"**:
- **Warm Architectural Surfaces:** A warm off-white alabaster canvas (`#F8F7F4`) paired with crisp pure-white telemetry cards (`#FFFFFF`) and stone-gray structural hairlines (`#E5E3DC`).
- **High-Density Readability:** Tabular monospace numerals (`font-mono tabular-nums`) for every SKU, order ID, health percentage, repair duration, and timestamp.
- **Zero-Ambiguity Hierarchy:** Cobalt Blue (`#0052FF`) is reserved strictly for primary interactive actions, active focus states, and key analytical highlights.

---

## 2. Color Palette (Exact HEX Values)

### 2.1 Surfaces & Canvas
| Token | Tailwind Class | HEX | Usage |
|---|---|---|---|
| `canvas.DEFAULT` | `bg-[#F8F7F4]` / `bg-canvas` | `#F8F7F4` | Main application background (warm off-white) |
| `canvas.subtle` | `bg-[#F4F2ED]` / `bg-canvas-subtle` | `#F4F2ED` | Persistent left sidebar & recessed wells |
| `canvas.muted` | `bg-[#EAE7E0]` / `bg-canvas-muted` | `#EAE7E0` | Progress bar tracks, hover fills on sidebar |
| `surface.DEFAULT` | `bg-[#FFFFFF]` / `bg-surface` | `#FFFFFF` | Primary cards, tables, modals, input backgrounds |
| `surface.subtle` | `bg-[#FAF9F6]` / `bg-surface-subtle` | `#FAF9F6` | Table headers (`thead`), row hover states, sub-cards |

### 2.2 Typography (Ink)
| Token | Tailwind Class | HEX | Usage |
|---|---|---|---|
| `ink.DEFAULT` | `text-[#111315]` / `text-ink` | `#111315` | Primary headings, KPI numbers, entity titles |
| `ink.secondary` | `text-[#373B40]` / `text-ink-secondary` | `#373B40` | Body copy, navigation labels, secondary table cells |
| `ink.muted` | `text-[#5C6168]` / `text-ink-muted` | `#5C6168` | Subtitles, column headers, descriptions |
| `ink.subtle` | `text-[#868C94]` / `text-ink-subtle` | `#868C94` | Timestamps, rule codes, disabled labels |

### 2.3 Primary Accent (Cobalt Blue)
| Token | Tailwind Class | HEX | Usage |
|---|---|---|---|
| `cobalt.DEFAULT` | `bg-[#0052FF]` / `text-[#0052FF]` | `#0052FF` | Primary CTA buttons, active icons, chart highlights |
| `cobalt.hover` | `hover:bg-[#0040CC]` | `#0040CC` | Hover state for primary buttons and links |
| `cobalt.subtle` | `bg-[#EDF2FF]` | `#EDF2FF` | Info banners, demo mode badges, active pill fills |
| `cobalt.border` | `border-[#C7D7FE]` | `#C7D7FE` | Border for cobalt-tinted callouts and badges |

### 2.4 Semantic Status Palette
| Status | Text HEX | Background HEX | Border HEX | Indicator Dot |
|---|---|---|---|---|
| **Critical (P1)** | `#B91C1C` | `#FEF2F2` | `#FECACA` | `#DC2626` |
| **Warning (P2)** | `#B45309` | `#FFFBEB` | `#FDE68A` | `#D97706` |
| **Optimal / Active** | `#046C4E` | `#ECFDF5` | `#A7F3D0` | `#059669` |
| **Demo / Info** | `#0040CC` | `#EDF2FF` | `#C7D7FE` | `#0052FF` |

---

## 3. Typography & Font Scale

- **Sans-Serif (`font-sans`):** `Inter` / `Geist` with OpenType features `"cv02", "cv03", "cv04", "cv11"`.
- **Monospace (`font-mono`):** `Geist Mono` / `JetBrains Mono` / `SFMono-Regular` with `tabular-nums`.

| Role | Size | Line Height | Weight | Tracking | Classes |
|---|---|---|---|---|---|
| **Hero / Display KPI** | `36px` (`text-4xl`) | `40px` | `700` (Bold) | `-0.03em` | `font-mono text-4xl font-bold tracking-tight tabular-nums` |
| **Page Title** | `18px` (`text-lg`) | `26px` | `600` (SemiBold) | `-0.02em` | `text-lg font-semibold tracking-tight text-[#111315]` |
| **Section Heading** | `14px` (`text-sm`) | `20px` | `600` (SemiBold) | `-0.01em` | `text-sm font-semibold text-[#111315]` |
| **Eyebrow Label** | `11px` (`text-[11px]`) | `14px` | `600` (SemiBold) | `+0.06em` | `pci-eyebrow` (`uppercase tracking-wider text-[#5C6168]`) |
| **Body / Table Cell** | `12px` (`text-xs`) | `18px` | `400` / `500` | `0em` | `text-xs text-[#373B40]` |
| **Micro Telemetry** | `10px` (`text-[10px]`) | `14px` | `600` (SemiBold) | `+0.04em` | `text-[10px] font-mono text-[#5C6168]` |

---

## 4. Spacing System

Follow a strict `4px` base unit grid:
- **Workspace Container Padding:** `p-4 sm:p-8` (`16px` mobile, `32px` desktop), max width `max-w-[1400px]`.
- **Grid Gaps:** `gap-4` (`16px`) between KPI cards and analytical panels.
- **Vertical Section Rhythm:** `space-y-6` (`24px`) between major dashboard rows.
- **Internal Card Padding:** `p-5` (`20px`) for standard cards; `px-4 py-3` (`16px` / `12px`) for table cells.

---

## 5. Border Radius Values

Avoid oversized pill cards. Use crisp technical radii:
- **Badges & Micro Pills:** `4px` – `5px` (`rounded` / `rounded-[5px]`)
- **Buttons, Inputs & Sidebar Links:** `6px` (`rounded-md`)
- **Sub-cards & Chart Containers:** `8px` (`rounded-lg`)
- **Primary Dashboard Cards & Tables:** `10px` (`rounded-[10px]` via `.pci-card`)

---

## 6. Shadows & Borders

- **Primary Structural Border:** `1px solid #E5E3DC` (`border-[#E5E3DC]`)
- **Internal Divider Hairline:** `1px solid #EFECE6` (`border-[#EFECE6]` / `divide-[#EFECE6]`)
- **Hover Border Emphasis:** `1px solid #CFCBC2` (`hover:border-[#CFCBC2]`)
- **Card Elevation (`shadow-xs`):** `0 1px 2px 0 rgba(17, 19, 21, 0.04)`
- **Interactive Hover Elevation (`shadow-card-hover`):** `0 4px 12px -2px rgba(17, 19, 21, 0.06)`

---

## 7. Button Variants

Defined in `src/app/globals.css`:
1. **Primary Cobalt (`.btn-primary-cobalt`):**
   - Background: `#0052FF`, Hover: `#0040CC`, Text: `#FFFFFF`, Border: `1px solid #0045D8`, Radius: `6px`, Font: `12px SemiBold`.
   - Use for the primary screen action (e.g., *Uruchom Audyt*, *Zapisz Połączenie*).
2. **Primary Ink (`.btn-primary-ink`):**
   - Background: `#111315`, Hover: `#272B30`, Text: `#FFFFFF`, Radius: `6px`, Font: `12px SemiBold`.
   - Use for high-priority secondary navigation (e.g., *Inspekcja*, *Przejdź do raportu*).
3. **Secondary Surface (`.btn-secondary-surface`):**
   - Background: `#FFFFFF`, Hover: `#FAF9F6`, Text: `#373B40`, Border: `1px solid #E5E3DC`, Radius: `6px`, Font: `12px Medium`.
   - Use for utility actions (e.g., *PDF*, *Klucze API*, *Filtruj*).

---

## 8. Card Specifications (`.pci-card`)

```tsx
<div className="pci-card p-5 flex flex-col justify-between">
  <div className="flex items-start justify-between gap-2">
    <div>
      <span className="pci-eyebrow">Kategoria Metryki</span>
      <h2 className="text-xs font-semibold text-[#111315] mt-0.5">Tytuł Karty</h2>
    </div>
    <span className="badge-active">Status</span>
  </div>
  <div className="my-4 font-mono text-4xl font-bold text-[#111315] tabular-nums">94%</div>
  <div className="pt-3 border-t border-[#EFECE6] text-[11px] text-[#5C6168]">
    Stopka telemetrii
  </div>
</div>
```

---

## 9. Sidebar & Navigation Specifications (`src/components/AppSidebar.tsx`)

- **Width:** Fixed `252px` (`w-[252px]`) on `lg` (`1024px+`) screens; collapsible top bar + slide-over drawer on `<1024px`.
- **Surface:** `#F4F2ED` with `1px solid #E5E3DC` right border.
- **Structure:**
  1. Brand header (`h-14`) with `PCI-2.4` monospace version badge.
  2. Active Store Workspace Switcher card showing `READ-ONLY` or `DEMO` live dot.
  3. Categorized navigation groups (`Diagnostyka i Analiza`, `Infrastruktura Danych`, `Administracja Systemu`).
  4. Active item styling: `bg-[#FFFFFF] text-[#111315] font-semibold border border-[#E5E3DC] shadow-xs` with `#0052FF` icon.
  5. Bottom telemetry box showing `AES-256-GCM` & `Limit: 95 req/min` + authenticated user strip.

---

## 10. Table Styling

- **Wrapper:** `div.pci-card.overflow-hidden`
- **Header (`thead`):** `bg-[#FAF9F6] border-b border-[#E5E3DC] text-[10px] font-mono uppercase tracking-wider text-[#5C6168]`
- **Cells (`th` / `td`):** `py-2.5 px-4` for headers; `py-3 px-4` for body rows.
- **Row Dividers:** `divide-y divide-[#EFECE6]`
- **Row Hover:** `hover:bg-[#FAF9F6] transition`

---

## 11. Chart Styling

- **Container:** Recessed well `bg-[#FAF9F6] border border-[#EFECE6] rounded-lg p-4`.
- **Grid Lines:** Horizontal dashed reference lines (`border-b border-dashed border-[#E5E3DC]`) with `9px` monospace axis labels.
- **Series Colors:**
  - Active / Latest data point: `#0052FF` (Cobalt)
  - Healthy historical points: `#059669` (Emerald)
  - Standard historical points: `#373B40` (Charcoal)
  - Severity distribution stacked segments: `#DC2626` (Critical), `#D97706` (Warning), `#0052FF` (Info).

---

## 12. Status Indicators

Use the standardized CSS classes in `src/app/globals.css`:
- `.badge-critical` — Critical P1 errors (`KRYTYCZNY`)
- `.badge-warning` — Operational P2 warnings (`OSTRZEŻENIE`)
- `.badge-active` — Healthy / Verified Read-Only (`OPTYMALNY` / `READ-ONLY`)
- `.badge-demo` — Synthetic demonstration mode (`DEMO` / `AUTO-FIX API`)
- `.badge-neutral` — Informational (`INFO`)

---

## 13. Form Components

- **Text & Search Inputs:**
  ```tsx
  <input
    type="text"
    className="px-3 py-1.5 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] focus:bg-[#FFFFFF] transition"
  />
  ```
- **Segmented Filter Tabs:**
  - Container: `inline-flex p-0.5 rounded-md bg-[#F4F2ED] border border-[#E5E3DC]`
  - Active Tab: `bg-[#FFFFFF] text-[#111315] font-semibold shadow-xs`
  - Inactive Tab: `text-[#5C6168] hover:text-[#111315]`

---

## 14. Responsive Breakpoints

- `sm` (`640px`): 2-column KPI grid, inline action buttons.
- `md` (`768px`): Table filter bar aligns horizontally with headers.
- `lg` (`1024px`): Persistent left `AppSidebar` (`252px`) activates; `7:5` analytical chart split activates.
- `xl` (`1280px`): Full 4-column KPI matrix (`grid-cols-4`).

---

## 15. Animation Guidelines

- Keep transitions functional and fast (`120ms`–`150ms` `cubic-bezier(0.16, 1, 0.3, 1)`).
- Progress bars and chart bars may use `transition-all duration-300`.
- Never use floating/bouncing decorative animations. Use `animate-spin` only for active API scan indicators and `animate-pulse` only for skeleton loading states.

---

## 16. Reusable Component Examples

### Sticky Workspace Header Bar
```tsx
<header className="sticky top-0 z-30 h-14 px-4 sm:px-8 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E5E3DC] flex items-center justify-between gap-4">
  <div className="flex items-center gap-2.5">
    <span className="text-xs font-medium text-[#5C6168]">Diagnostyka</span>
    <span className="text-[#CFCBC2]">/</span>
    <h1 className="text-sm font-semibold text-[#111315]">Nazwa Widoku</h1>
  </div>
  <div className="flex items-center gap-2.5">
    <button className="btn-primary-cobalt">Akcja Główna</button>
  </div>
</header>
```
