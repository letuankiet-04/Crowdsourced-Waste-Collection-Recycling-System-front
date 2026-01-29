## Goal
Create a reusable ActionCard component (so the Citizen dashboard ActionCards can be reused on other pages) while keeping the current look/feel.

## Key Findings
- Current ActionCards is hardcoded and builds Tailwind classes dynamically (e.g. `group-hover:shadow-${...}` and `to-${...}`), which Tailwind v4 will not reliably generate because those class names don’t exist as string literals.

## Component Design
- Add `src/components/ui/ActionCard.jsx`.
- Props:
  - `to` (string, route)
  - `title` (string)
  - `icon` (ReactNode)
  - `variant` (string: `green | blue | orange` initially)
  - `className` (optional)
- Implement variants as an internal map with fully static Tailwind class strings:
  - `bgColor`: `bg-green-500` / `bg-blue-500` / `bg-orange-500`
  - `glowBg`: `bg-gradient-to-br from-white to-green-500` etc.
  - `hoverShadow`: `group-hover:shadow-green-500/50` etc.

## Refactor Citizen ActionCards
- Update `src/pages/role/citizen/dashboard_comp/ActionCards.jsx` to:
  - keep the `actions` array but replace `bgColor/iconColor` with `variant`
  - render `<ActionCard ... />` instead of duplicating markup
  - remove all runtime-generated Tailwind class names

## Reusability Example
- Ensure other pages can import and use it as:
  - `import ActionCard from "../../../components/ui/ActionCard"` (path depends on location)
  - `<ActionCard to="/some-route" title="..." icon={<.../>} variant="green" />`

## Verification
- Run `npm run build` to ensure Tailwind class generation is correct.
- Run the app and open the Citizen dashboard to confirm hover glow/shimmer/shadow still work visually and routes still navigate correctly.