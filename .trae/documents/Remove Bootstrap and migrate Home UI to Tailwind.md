## What I Found
- Bootstrap is loaded globally in [main.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/main.jsx#L7-L10) and declared in [package.json](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/package.json#L12-L20).
- Bootstrap classNames are only used on the Home page components under [src/pages/home](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/home).
- Auth pages are already Tailwind-based.
- `lucide-react` is already installed, so we can replace `bootstrap-icons` cleanly.

## Goal
- Remove Bootstrap completely (CSS + JS + dependency).
- Convert all Bootstrap-styled Home components to Tailwind equivalents.
- Remove Bootstrap Icons by replacing them with `lucide-react` icons.

## Step 1 — Uninstall Bootstrap (Dependency + Imports)
1. Update [package.json](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/package.json) to remove:
   - `bootstrap`
   - `bootstrap-icons`
2. Update [main.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/main.jsx#L7-L10) to remove global imports:
   - `bootstrap/dist/css/bootstrap.min.css`
   - `bootstrap/dist/js/bootstrap.bundle.min.js`
   - `bootstrap-icons/font/bootstrap-icons.css`

## Step 2 — Create Consistent Tailwind Layout Primitives
- Add a small reusable `Container` component (or a shared constant class string) to avoid repeating:
  - `mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8`
- Optionally standardize buttons (primary + outline) so Home + Auth feel consistent.

## Step 3 — Migrate Home Components (Bootstrap → Tailwind)
Convert Bootstrap grid/utility classes to Tailwind in these files:
- [HomeHeader.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/home/HomeHeader.jsx)
  - `navbar/bg-dark/container/d-flex/...` → Tailwind flex layout, dark header, spacing, link styles
  - `btn btn-success` → Tailwind emerald button
- [HeroSection.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/home/HeroSection.jsx)
  - `display-5/lead/btn/me-3` → Tailwind typography + spacing
- [StatsSection.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/home/StatsSection.jsx)
  - `row/col-md-4` → `grid grid-cols-1 md:grid-cols-3`
- [AboutSection.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/home/AboutSection.jsx)
  - `row/col-md-4/border-secondary` → Tailwind cards
  - Replace `<i className="bi ...">` with `lucide-react` icons (e.g., `MapPin`, `Gift`, `TrendingUp`)
- [MissionSection.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/home/MissionSection.jsx)
  - `row/col-lg-6/badge/...` → Tailwind grid + pill/badge styles
- [EnterprireSection.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/home/EnterprireSection.jsx)
  - `card/shadow-sm/rounded-4/g-5/img-fluid` → Tailwind card layout + responsive grid
- [CTASection.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/home/CTASection.jsx)
  - `btn btn-outline-success/bg-opacity-10` → Tailwind primary + outline buttons
- [HomeFooter.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/home/HomeFooter.jsx)
  - `border-top/text-muted` → Tailwind border + muted text

## Step 4 — Verification
- Run `npm run build` and `npm run lint`.
- Visually verify `/home` and `/auth/login` in the dev server to ensure:
  - No missing styles (Bootstrap removed)
  - Layout still responsive
  - Icons render via `lucide-react`

## Notes / Assumptions
- I will keep the Home page look very close to the current one (dark header, emerald accent, similar spacing).
- Since Bootstrap is only used on Home, the migration scope is limited and low risk.