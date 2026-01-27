# Sign Up Page — UI Spec (React + Tailwind)

<img src="(provided screenshot in chat)" alt="Sign up page reference" style="max-width: 100%; border: 1px solid #e5e7eb; border-radius: 12px;" />

## Page
- Intended location (implementation): `src/pages/auth/SignUp.jsx` (plus optional `SignUpCard.jsx` + `SignUpVisual.jsx` for parity with `Login.jsx`).

## Layout
- Desktop-first: 2-column split layout using CSS Grid.
  - Left column: form panel on a white/light surface.
  - Right column: photo/visual panel with dark green overlay, trust badge, brand + quote block.
- Recommended CSS approach:
  - Outer: `grid grid-cols-1 lg:grid-cols-2 gap-6`.
- Form: stacked layout (`grid gap-4`) with one 2-column row for Password/Confirm, and one 2-column row for Email/OTP.
- Responsive behavior:
  - ≥1024px (lg): show both columns.
  - <1024px: collapse to single column; hide the right visual panel (or render it below as a collapsed section); keep form at `max-w-md` centered.

## Meta Information
- Title: “Create new account”
- Description: “Create your account to start using CrowdRecycle.”
- Open Graph: `og:title=Create new account`, `og:description=Create your account to start using CrowdRecycle.`

## Global Styles (design tokens)
- Page background: `bg-slate-50`.
- Card/surfaces: `bg-white`, `border-slate-200`, radius `rounded-3xl`, shadow `shadow-sm`.
- Typography:
  - Title: `text-3xl font-semibold text-slate-900`
  - Subtitle/body: `text-sm text-slate-600`
- Inputs:
  - Base: `rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm`
  - Focus: `focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600`
  - Error: `border-rose-300 focus:ring-rose-200` + inline error text `text-xs text-rose-700`
- Primary button (matches screenshot’s dark CTA): `bg-black text-white hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed`.
- Links: `text-emerald-700 hover:underline underline-offset-4`.

## Page Structure
1. Root container
   - `min-h-screen` with centered content (`mx-auto`) and padding (`px-4 py-10`).
2. Split shell
   - `max-w-6xl mx-auto` and `grid` split.
3. Left: Sign Up form card
   - Header, fields, primary CTA, “Already have an account? Log in”, footer links.
4. Right: Visual panel (desktop)
   - Background image (cover), green overlay, top-right “Trusted Partner” badge, bottom brand + quote.

## Sections & Components
### A) Left Form Panel
- Header block
  - Title: “Create new account”
  - Subtitle: “Join our community and start your journey today.”
- Form fields
  - Username (full width)
  - Password + Confirm Password (2 columns on desktop, stacked on mobile)
  - Email Address + OTP (2 columns on desktop, stacked on mobile)
- Primary CTA
  - Button: “Sign Up” full width.
  - Loading state: spinner + “Signing up…” (optional), disable all inputs.
- Secondary navigation
  - “Already have an account? Log in” uses `Link` to `/auth/login`.
- Footer links
  - “Privacy Policy”, “Terms of Service”, “Help Center” (can route to placeholders until wired).

### B) Right Visual Panel (Desktop)
- Background
  - Full-height background image (`object-cover`) with a dark green overlay gradient.
- Trust badge
  - Small pill/card at top-right (icon + “TRUSTED PARTNER”, optional small subtext).
- Brand + quote block
  - Brand mark + name (e.g., “EcoStructure”) near bottom.
  - Large quote text (italic/bold as in screenshot).
  - Small supporting line (e.g., “Join 10,000+ …”).

## Interaction & States
- Validation: show inline errors after blur and on submit; move focus to first invalid field on submit.
- Submitting: disable all inputs, prevent double submit.
- Success: show confirmation banner and redirect (default: to `/auth/login`).
- Failure: show form-level error banner; do not clear fields automatically.

## Accessibility
- Use `<label htmlFor>` for every field.
- Ensure tab order matches visual order (Username → Password → Confirm → Email → OTP → Sign Up → Log in link).
- Associate errors with inputs via `aria-describedby` and `aria-invalid`.
- Provide `autoComplete` attributes:
  - username: `username`
  - email: `email`
  - password: `new-password`
  - confirm: `new-password` (or omit autocomplete)
  - otp: `one-time-code` (where supported)
