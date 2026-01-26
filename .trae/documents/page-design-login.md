# Login Page — UI Spec (React + Tailwind)

<img src="(provided in chat)" alt="Login page reference" style="max-width: 100%; border: 1px solid #e5e7eb; border-radius: 12px;" />

## Page
- Intended location (implementation): `./pages/auth/Login.tsx` (or `LoginPage.tsx`) under `./pages/auth`.

## Layout
- Desktop-first: two-column split layout.
  - Left column: visual/brand panel (illustration/gradient area matching the screenshot).
  - Right column: form panel centered vertically and horizontally within its column.
- Recommended CSS approach: Flexbox for the main split; inner form area uses a stacked layout with consistent gaps (`gap-4/6`).
- Responsive behavior:
  - ≥1024px: 2 columns.
  - <1024px: collapse to single column; hide or move the visual panel above the form; keep form max width (e.g., `max-w-md`).

## Meta Information
- Title: “Sign in”
- Description: “Sign in to access your account.”
- Open Graph: `og:title=Sign in`, `og:description=Sign in to access your account.`

## Global Styles (design tokens)
- Background: `bg-slate-50` (or white if the screenshot is full white).
- Surfaces/cards: `bg-white`, border `border-slate-200`, radius `rounded-2xl`, shadow `shadow-sm`.
- Text:
  - Heading: `text-2xl font-semibold text-slate-900`
  - Body: `text-sm text-slate-600`
- Primary button: `bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`.
- Inputs: `border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600`.
- Links: `text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline`.

## Page Structure
1. Root container
   - Full height viewport (`min-h-screen`), centered content, padding for safe areas (`px-4 py-10`).
2. Split shell
   - `max-w-5xl mx-auto`, `grid grid-cols-1 lg:grid-cols-2` (or flex equivalent), consistent gap.
3. Left visual panel (desktop)
   - Illustration/brand card with background gradient and short copy (keep text optional/configurable).
4. Right form panel
   - A card or clean panel containing logo/title/subtitle, form fields, and actions.

## Sections & Components
### A) Brand/Visual Panel (Left)
- Elements:
  - Product mark/logo.
  - Optional headline + supporting text (match screenshot typography).
  - Illustration area (SVG or image).
- Responsibilities:
  - Purely presentational; no form elements.
  - Hidden/collapsed on smaller screens.

### B) Header Block (Form Panel)
- Elements:
  - Title (e.g., “Welcome back” / “Sign in”).
  - Subtitle (short guidance text).
- Responsibilities:
  - Provide context; no interaction.

### C) Login Form
- Email field
  - Label + input; placeholder aligned with screenshot.
  - Inline validation message under field (reserve space to prevent layout jump).
- Password field
  - Label + input.
  - Password visibility toggle (icon button inside input on the right).
- Row options
  - “Remember me” checkbox.
  - “Forgot password?” link aligned to the opposite side.
- Primary CTA
  - “Sign in” button spanning full width.
  - Loading state: show spinner + “Signing in…”; disable all inputs.
- Error banner (form-level)
  - Appears above CTA or under subtitle.
  - Shows server error text; supports dismiss or auto-clear on next submit.
- Footer
  - “Don’t have an account? Sign up” link.

## Interaction & States
- Default: empty inputs, CTA disabled only if your product standard requires it (otherwise enabled with validation on submit).
- Field error: red border + message; focus moves to first invalid field on submit.
- Submitting: disable inputs, prevent double submit.
- Success: navigate to configured post-login route.
- Failure: display human-readable error without clearing inputs; keep password cleared only if required by your security policy.

## Accessibility
- Use `<label htmlFor>` for all inputs.
- Ensure toggle buttons have `aria-label` (e.g., “Show password”).
- Maintain visible focus outlines for keyboard navigation.
- Error text should be associated via `aria-describedby`.