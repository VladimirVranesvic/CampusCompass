# CampusCompass Cleanup Report

## 1. Files / code not used (can remove or repurpose)

### Dead source files (never imported)

| File | Notes |
|------|--------|
| `lib/data/rental-parser.ts` | Parses XLSX rental bond data; app uses `rental-supabase.ts` instead. Not imported anywhere. |
| `lib/data/atar-calculator.ts` | ATAR scaling/conversion logic; `app/api/atar/route.ts` uses Supabase directly. Not imported anywhere. |
| `lib/data/youth-allowance-thresholds-parser.ts` | Parses CSV for Youth Allowance thresholds; app uses `youth-allowance-thresholds.ts` (getDefaultThresholds) only. Not imported anywhere. |

### Middleware (fixed)

| File | Issue |
|------|--------|
| ~~`proxy.ts`~~ | **Done:** Replaced by root `middleware.ts` so Supabase auth session refresh runs. |

### Unused UI components (shadcn-style; only used internally or not at all)

These are in `components/ui/` and are **not** imported by any app page or feature component. Safe to keep for future use or remove to shrink bundle.

- `components/ui/carousel.tsx` – no imports from app
- `components/ui/chart.tsx` – app uses `recharts` directly in `rent-estimator.tsx`, not this wrapper
- `components/ui/empty.tsx`
- `components/ui/field.tsx`
- `components/ui/form.tsx` – app uses `react-hook-form` + Input/Label etc. directly in `user-form.tsx`
- `components/ui/input-group.tsx`
- `components/ui/input-otp.tsx`
- `components/ui/item.tsx`
- `components/ui/kbd.tsx`
- `components/ui/menubar.tsx`
- `components/ui/pagination.tsx`
- `components/ui/resizable.tsx`
- `components/ui/sidebar.tsx` – only imports `use-mobile`; no page uses Sidebar
- `components/ui/sonner.tsx` – Sonner Toaster not used in `layout.tsx`
- `components/ui/spinner.tsx`
- `components/ui/table.tsx`
- `components/ui/toaster.tsx` – Toaster not in layout; no `toast()` calls in app (toast system unused)

### Hooks only used by unused UI

- `hooks/use-mobile.ts` – only used by `components/ui/sidebar.tsx` (unused)
- `hooks/use-toast.ts` – only used by `components/ui/toaster.tsx` (not in layout)

---

## 2. Unused / redundant code in files you keep

### `app/layout.tsx` (fixed)

- **Done:** Geist font is now applied to `<body>` via `className={geist.className}`. Unused `Geist_Mono` import removed.

### `app/api/plan/route.ts` (fixed)

- **Done:** `UNIVERSITY_POSTCODE` is now imported from `@/lib/data/geocoding`; single source of truth exported from `geocoding.ts`.

### `app/api/chat/route.ts`

- Imports only `NextResponse`; no `NextRequest`. Fine as-is.

---

## 3. Dependencies possibly unused

| Package | Notes |
|--------|--------|
| `xml2js` (+ `@types/xml2js`) | Not imported in any source file. Safe to remove from `package.json` if you don’t plan to parse XML. |

Other deps (e.g. Radix, recharts, date-fns, zod) are used.

---

## 4. File paths / structure (no critical issues)

- **App routes:** `app/page.tsx`, `app/login`, `app/signup`, `app/plans`, `app/plan`, `app/plan/[id]` – structure is clear.
- **Plan feature:** All plan-specific components live under `app/plan/components/` and are used by `app/plan/page.tsx` and `app/plan/[id]/page.tsx` (the latter imports `../components/results-dashboard` → `app/plan/components/results-dashboard.tsx`). No path cleanup required.
- **Shared UI:** `components/` for navbar, footer, hero, chat-widget, etc. and `components/ui/` for primitives – standard and fine.
- **Data/lib:** `lib/data/` has parsers and calculators; `lib/supabase/`, `lib/types/` are used. Only the three dead files listed above are unused.

**Optional consolidation:** You could move `app/plan/components/*` into a single `app/plan/_components/` (or keep as-is); current structure is already consistent.

---

## 5. Summary of recommended actions

1. ~~**Rename** `proxy.ts` → `middleware.ts`~~ **Done.**
2. ~~**Fix layout:** Apply Geist font to `<body>`~~ **Done.**
3. **Remove dead lib files** (optional): `lib/data/rental-parser.ts`, `lib/data/atar-calculator.ts`, `lib/data/youth-allowance-thresholds-parser.ts`.
4. ~~**Deduplicate:** In `app/api/plan/route.ts`, use shared `UNIVERSITY_POSTCODE` from geocoding~~ **Done.**
5. **Optional:** Remove `xml2js` and `@types/xml2js` from `package.json` if not needed.
6. **Optional:** Remove unused UI components and hooks listed above if you want a smaller repo; otherwise keep for future use.
