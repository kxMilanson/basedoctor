# BaseDoctor Design System — "Commerce, made clear."

**Target User:** Small & medium e-commerce store owners, Allegro sellers, and store managers (non-technical).  
**Visual Inspiration:** Linear's visual discipline, Notion's warmth and simplicity, Shopify's commercial clarity.

---

## 1. Design Philosophy

BaseDoctor translates complex catalog, inventory, and order checks into calm, plain-Polish business guidance:
- **Clarity over Density:** Answer the 4 merchant questions first (*Is my store healthy? What needs attention? How serious is it? What do I do next?*).
- **Warm, Trustworthy Surfaces:** Ivory canvas (`#FAF8F5`), warm sand sidebar (`#F3F0EA`), and crisp white cards (`#FFFFFF`) with soft stone borders (`#E8E4DC`).
- **Natural Language:** Zero developer jargon in primary views. Urgency is communicated as *Pilne*, *Warto poprawić*, and *Wskazówka*.

---

## 2. Color Palette

| Role | Name | HEX | Usage |
|---|---|---|---|
| **Canvas** | Warm Ivory | `#FAF8F5` | Main application background |
| **Sidebar / Recessed** | Warm Sand | `#F3F0EA` | Persistent sidebar, subtle containers |
| **Card Surface** | Paper White | `#FFFFFF` | Cards, panels, modals, inputs |
| **Outer Border** | Warm Stone | `#E8E4DC` | Card & layout borders |
| **Inner Divider** | Soft Linen | `#F1EFEA` | Section & row dividers |
| **Primary Text** | Deep Charcoal | `#18181B` | Headings, key metrics, primary ink |
| **Body Text** | Slate Charcoal | `#3F3F46` | Descriptions, table copy |
| **Muted Text** | Warm Gray | `#71717A` | Captions, helper text |
| **Brand Accent** | Botanical Teal | `#0F766E` | Primary actions, active states, brand highlights |
| **Brand Hover** | Deep Teal | `#115E59` | Hover state for `.btn-studio-brand` |
| **Urgent / Critical** | Rose Crimson | `#BE123C` / `#FFF1F2` | Pilne — blokuje sprzedaż lub wysyłkę |
| **Warning** | Warm Amber | `#B45309` / `#FFFBEB` | Warto poprawić — ryzyko dopłat/opóźnień |
| **Healthy** | Emerald | `#047857` / `#ECFDF5` | Wszystko w porządku / Połączenie bezpieczne |

---

## 3. Typography & Radii

- **Font Family:** `Inter` (`font-sans`), with `tabular-nums` for aligned metrics and `font-mono` reserved strictly for SKU/Order identifiers inside pills.
- **Border Radius:**
  - Cards (`.studio-card`): `16px` (`rounded-2xl`)
  - Buttons & Inputs: `12px` (`rounded-xl`)
  - Status Pills: `9999px` (`rounded-full`)
- **Shadow:** `0 2px 10px -2px rgba(24, 24, 27, 0.04), 0 1px 2px 0 rgba(24, 24, 27, 0.02)`

---

## 4. Reusable Components (`src/app/globals.css`)

- **Cards:** `.studio-card`, `.studio-card-hover`
- **Buttons:** `.btn-studio-brand` (Teal `#0F766E`), `.btn-studio-primary` (Charcoal `#18181B`), `.btn-studio-secondary` (White `#FFFFFF`)
- **Status Pills:** `.pill-urgent`, `.pill-warning`, `.pill-healthy`, `.pill-demo`, `.pill-neutral`
