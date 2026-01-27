# Animated Auth UI Implementation Report

## Goal
- Build an animated Login/Register experience (UI/animation only) in React + Tailwind that matches the “sliding panels” effect from the reference tutorial.

## What I built
- A single animated auth page rendered at both routes:
  - `/auth/login`
  - `/auth/signup`
- Desktop (lg+) animation:
  - The form panel slides left/right.
  - A colorful overlay panel slides in the opposite direction, creating the “swap” effect.
- Mobile behavior:
  - Uses a compact tab switcher (Sign in / Sign up) with smooth fade/translate transitions.

## Implementation notes
- Route-driven state:
  - The UI mode is derived from the current pathname, so deep links work reliably.
  - Switching between modes uses navigation to keep URLs correct.
- Demo-only submit behavior:
  - Both forms simulate a network request and show a small feedback banner.
  - No backend wiring was added (per “Just animated” requirement).

## Files added/updated
- Added: `src/pages/auth/animated_auth/AnimatedAuth.jsx`

## How to preview
1. Start dev server: `npm run dev`
2. Open:
   - `http://localhost:5173/auth/login`
   - `http://localhost:5173/auth/signup`

