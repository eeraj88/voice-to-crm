# VoyC Landingpage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the VoyC landing page into a more distinctive, premium-looking product page without changing core app behavior.

**Architecture:** Keep the work concentrated in the landing page, global theme typography, and shared layout metadata. Rework the homepage into a clearer editorial composition with stronger hierarchy, tighter copy, and a more intentional visual system while preserving existing navigation, login flow, and contact form.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, next/font, existing theme context, existing hero video and logo assets.

---

### Task 1: Update the global visual system

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the default font stack with a more distinctive pairing**

```tsx
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google"
```

- [ ] **Step 2: Adjust CSS variables and base styles to support the new editorial look**

```css
:root {
  --font-display: var(--font-cormorant-garamond);
  --font-body: var(--font-ibm-plex-sans);
}
```

- [ ] **Step 3: Add reusable utilities for ambient backgrounds, glass panels, and section rhythm**

```css
.page-shell { ... }
.section-frame { ... }
.ambient-grid { ... }
```

- [ ] **Step 4: Verify the app still builds and the theme toggle still works**

Run: `npm run build`
Expected: build succeeds without new CSS or font errors

### Task 2: Rebuild the homepage composition

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the current oversized landing markup with a tighter, more premium structure**

```tsx
export default function HomePage() {
  return (
    <main className="page-shell">
      ...
    </main>
  )
}
```

- [ ] **Step 2: Keep the current business sections but regroup them into a more intentional flow**

```tsx
const highlights = [...]
const steps = [...]
const pricing = [...]
```

- [ ] **Step 3: Make the hero more editorial and product-led**

```tsx
<section className="hero-grid">
  <div className="hero-copy">...</div>
  <div className="hero-preview">...</div>
</section>
```

- [ ] **Step 4: Preserve the login CTA, contact form, and theme toggle behavior**

```tsx
<Link href="/login">...</Link>
<button onClick={toggleTheme}>...</button>
```

- [ ] **Step 5: Verify the page renders and the homepage still compiles**

Run: `npm run build`
Expected: build succeeds and the homepage renders with the new layout

### Task 3: Polish and verify

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Tidy any spacing, contrast, and responsive issues found after the first pass**

```css
@media (max-width: 768px) {
  .hero-grid { ... }
}
```

- [ ] **Step 2: Confirm the final page is visually balanced on desktop and mobile**

Run: `npm run build`
Expected: no regressions

- [ ] **Step 3: Commit the redesign once the page is stable**

```bash
git add src/app/page.tsx src/app/layout.tsx src/app/globals.css docs/superpowers/plans/2026-06-10-voyc-landingpage-redesign.md
git commit -m "feat: redesign voyc landing page"
```
