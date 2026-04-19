# EasyRest Agent Brief — Shared Design Contract

You are one of **10 builder agents + 3 orchestrators** working in parallel to extend the **EasyRest** demo (restaurant SaaS platform). Read this file completely before writing any code. It is the source of truth for design, patterns, and conventions.

## 1 · Project stack
- **React 19** + **TypeScript** (strict) + **Vite 7**
- **Tailwind CSS 4** (with CSS-variable theme, see `src/styles/globals.css`)
- **Framer Motion** (`motion` / `AnimatePresence`)
- **React Router 7** (declared in `src/router.tsx`)
- **Zustand** (`useStore()` from `src/store/index.ts`)
- **Recharts** for charts (optional)
- **lucide-react** for icons
- **react-countup** via `<CountUp>` wrapper

## 2 · Aesthetic — black / white / gold (no deviation)
Existing design-system tokens (use these class names, never hex literals):

| token | value | Tailwind class |
|-------|-------|----------------|
| primary-black | `#0A0A0A` | `bg-primary-black` / `text-primary-black` |
| primary-white | `#FFFFFF` | `bg-primary-white` / `text-primary-white` |
| accent-gold | `#C9A962` | `bg-accent-gold` / `text-accent-gold` / `border-accent-gold` |
| accent-gold-dark | `#A88B4A` | `bg-accent-gold-dark` |
| success | `#22C55E` | `bg-success` / `text-success` |
| warning | `#EAB308` | `bg-warning` / `text-warning` |
| danger | `#EF4444` | `bg-danger` / `text-danger` |
| gray-* | 100/300/500/800 | `bg-gray-50`, `text-gray-500`, etc. |

The product voice is **editorial Italian**, understated, confident. Copy is in Italian without accented characters (use "e'" / "a'" convention already present in codebase, or plain "e" for "è" — match surrounding files). No emojis in UI copy.

## 3 · Typography
- Font family: Inter (already loaded via index.html).
- Headings: `tracking-tight text-gray-900 font-bold`.
- Page title: `text-3xl sm:text-4xl`. Section title: `text-2xl font-semibold`.
- Body: `text-gray-500` / `text-gray-600`. Subtle label: `text-[10px] uppercase tracking-[0.2em] text-gray-500` or `text-xs uppercase tracking-widest text-gray-400`.
- Monospace fallback with `font-mono` for lot codes, QR strings, barcodes, timestamps.

## 4 · File-path conventions
- **New page file**: `src/modules/<module-id>/<PascalCase>Page.tsx`
- **Barrel**: `src/modules/<module-id>/index.ts` re-exporting the page.
- Types live in `src/types/index.ts` (all new types already declared).
- Mock data lives in `src/data/<entity>.ts` (stubs already present, filled by ORCH-2).
- Never create additional Markdown / readme files.

## 5 · Required page skeleton (every new page MUST follow)

```tsx
import { motion } from 'framer-motion';
import { /* icons */ } from 'lucide-react';
import { Card, Badge, Button, CountUp, ProgressBar, StatusDot } from '../../components/ui';
import { Breadcrumb, PageHeader, Section } from '../../components/layout';
import { useStore } from '../../store';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

export function <Name>Page() {
  // local useState / useStore reads here
  return (
    <motion.div className="min-h-screen bg-gray-50/50" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: 'Panoramica', href: '/overview' }, { label: '<Title>' }]} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageHeader title="<Title>" subtitle="<1–2 sentence Italian subtitle>" />
        </motion.div>

        {/* KPI strip (optional) */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* <Card> blocks with CountUp */}
        </motion.div>

        <Section title="...">
          {/* content */}
        </Section>

        {/* EE Partners branding footer — ALWAYS include */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 pt-8 pb-4">
          <img src="/logos/ee-dark.png" alt="EE Partners" className="h-8 w-auto opacity-30" />
        </motion.div>
      </div>
    </motion.div>
  );
}
```

## 6 · UI component reference (import from `../../components/ui`)

- `<Card padding="sm|md|lg|none" hoverable? onClick?>` — rounded-2xl white card with subtle border/shadow. If `className` contains `bg-*`, base bg is suppressed.
- `<Button variant="primary|secondary|ghost" size="sm|md|lg">` — primary = gold.
- `<Badge variant="success|warning|danger|info|gold|default|development" size="sm|md|lg">`.
- `<CountUp end={n} prefix="EUR " suffix="%" decimals={1} separator="." duration={2}/>` — animated counter.
- `<ProgressBar value={n} max={100} color="bg-accent-gold"/>`.
- `<StatusDot status="success|warning|danger|info|neutral" label="..." />`.

## 7 · Layout component reference (import from `../../components/layout`)

- `<Breadcrumb items={[{label, href?}, ...]}/>`
- `<PageHeader title subtitle? badge?/>`
- `<Section title? subtitle? className?>children</Section>` — adds `mb-16` bottom spacing.

## 8 · Motion patterns
- Always wrap root in `motion.div` with `containerVariants`, and **every top-level block** that should stagger with `<motion.div variants={itemVariants}>`.
- For list reveals use `initial/animate/transition` with `delay: i * 0.06` (~0.05–0.1).
- For emphatic reveals use `whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}`.
- Subtle **infinite pulse** on accent icons: `animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}`.
- AnimatePresence for swap between phases (e.g. idle → scanning → done).
- Easing tuple must be typed `as [number, number, number, number]` (TypeScript strict).

## 9 · Data access
The `useStore()` hook exposes: `recipes, products, preparations, sales, haccp, reservations, customers, customerVisits, loyaltyRewards, recipeCards, kdsOrders, storageZones, menuImports` plus helpers. Prefer store reads; fall back to direct imports from `src/data/*` when necessary.

**Helper date/format utils** are in `src/utils/calculations.ts`: `formatCurrency`, `formatDate`, `formatDateShort`, `formatWeight`, `daysUntilExpiry`, `getExpiryStatus`, `calculateMarginPercentage`. Reuse these.

**Today's demo date**: `2026-02-22`. Hard-code this when comparing "oggi". Some data keys to that date.

## 10 · Italian copy rules
- Every label, header, subtitle, empty-state is in **Italian**.
- Use plain ASCII ("e" instead of "è", "a'" instead of "à" — match existing files).
- Keep tone concise, professional, product-led. Avoid hype/marketing slop.
- Include realistic Italian surnames and place names where appropriate.

## 11 · What NOT to do
- Don't install new npm packages. Use only what's in package.json.
- Don't change theme tokens, fonts, or the Shell/Sidebar structure.
- Don't add docstrings, JSDoc, block comments. One-line inline comments only when genuinely non-obvious.
- Don't overuse emojis or decorative unicode.
- Don't rename existing files or types. Extend only.
- Don't create markdown/readme files.

## 12 · "Demo-grade" expectations
- Every page must work **interactively**. Simulated flows with phases (idle → processing → done), animated counters, charts with real mock data, QR SVGs, live table updates.
- Every page must read meaningful mock data from the store or `data/`.
- Every page must have: Breadcrumb, PageHeader, ≥1 Section, and the EE Partners footer branding.
- Target: a user clicks through and believes the product is real.

## 13 · Current today date in demo
`2026-02-22` (Saturday). Use for "oggi".

---

When your specific task prompt references this file, build the page with **max care**: unique layout choices, carefully orchestrated motion, meaningful data, and Italian copy that sounds written by a product person — not by a machine.
