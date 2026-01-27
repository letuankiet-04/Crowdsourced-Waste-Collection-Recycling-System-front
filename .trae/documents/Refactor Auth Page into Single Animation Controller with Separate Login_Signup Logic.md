**Goal**
- Have one clear controller component that drives all auth-page animation and mode switching.
- Give Login and Sign Up their own focused logic (form state, validation, submit) instead of mixing everything into one big page component.
- Keep the existing animated UI (sliding overlay + cross-fade forms + mobile toggle) visually the same or smoother.
- Clean up and organize the auth code so it is easier to maintain and extend.

**1. Analyze Current Implementation**
- Confirm how `AnimatedAuth` currently works:
  - URL (`/auth/login` vs `/auth/signup`) decides `mode` using `useLocation`.
  - `navigate` is used to switch between modes.
  - The same file contains layout, animation CSS classes, and both forms’ logic.
  - Tailwind classes control all animations (overlay slide, panel slide, form cross-fade).
- Identify duplicated or tightly coupled logic inside `AnimatedAuth` (field handling, submit handlers, demo/simulated network logic, etc.).

**2. Define Target Architecture**
- Introduce an explicit controller component (for example `AuthController` or rename `AnimatedAuth` to act as the controller):
  - Single responsibility: decide current `mode`, handle navigation between `login` and `signup`, coordinate animation state, orchestrate submit flows.
  - Lean render function that delegates UI pieces to presentational components.
- Split the page into smaller components:
  - `AuthLayout` (or keep `AnimatedAuth` as layout) for background image, overall layout, and shared structure.
  - `DesktopOverlay` (keep or slightly refine) for the sliding overlay panel; it receives `mode` as a prop.
  - `AuthForms` wrapper that receives `mode` and renders the correct form with transitions.
  - `LoginForm` and `SignupForm` components with their own internal form state and validation.
  - Reuse existing `AuthField` and `PrimaryButton`, and consider moving them into a small shared `auth/components` folder for reuse.
- Keep routing simple:
  - Continue routing both `/auth/login` and `/auth/signup` to the same top-level page component (controller).
  - Keep URL as the single source of truth for `mode` to avoid desync issues.

**3. Design the Controller Logic**
- `mode` management:
  - Derive `mode` from the current location (`'login'` or `'signup'`).
  - Provide `goLogin` and `goSignup` handlers that use `navigate` to update the URL.
- Animation control:
  - The controller exposes a stable `mode` prop to all animated parts.
  - Animations remain class-based (Tailwind), but now live in smaller components that compute their classes from `mode`.
  - Ensure all animated containers share the same `transition` durations and easing (still 700ms, `ease-in-out`) so they stay in sync.
- Submit orchestration:
  - `LoginForm` and `SignupForm` call `onSubmit` props with their respective payloads.
  - The controller handles async behavior: pending states, success, error, and post-success navigation.
  - Replace or wrap the existing `simulate()` helper with a clearer abstraction (`useAuthSimulation` or `authService` placeholder) so the controller is not cluttered.

**4. Extract Login and Signup Logic into Dedicated Components**
- `LoginForm`:
  - Props: `onSubmit`, `loading`, optional `error`, and possibly `onSwitchToSignup` for the inline link.
  - Internal state: email, password, remember flag.
  - Validation and basic error handling inside the component, but defers to `onSubmit` for final auth.
  - Uses `AuthField` and `PrimaryButton`, preserving their existing styling and hover states.
- `SignupForm`:
  - Props: `onSubmit`, `loading`, `error`, and `onSwitchToLogin`.
  - Internal state: name, email, password (and any additional fields present).
  - Own validation rules and error display logic.
  - Uses the same shared input/button components to keep a unified visual style.
- Cross-fade behavior:
  - `AuthForms` maintains the current form wrapper and uses `mode` to apply the same opacity and translate classes as today.
  - Only one form should be “interactive” (`pointer-events-auto`), the other hidden/inert with `opacity-0` and `pointer-events-none`.

**5. Preserve and Clarify Animation Behavior**
- Desktop overlay:
  - Keep the current `DesktopOverlay` behavior (sliding panels) but pass `mode` as a prop from the controller.
  - Clean the class logic so that it’s easy to see which transform applies in `login` vs `signup` modes.
- Main form panel:
  - Keep the horizontal slide (`translate-x-full` vs `translate-x-0`) controlled by `mode`.
  - Confirm responsive behavior: `lg:absolute` and `lg:w-1/2` should still behave correctly after refactor.
- Form transition:
  - Ensure both `LoginForm` and `SignupForm` keep `transition-all duration-700 ease-in-out` and the ±`translate-y-*` classes for the vertical slide/cross-fade.
- Mobile toggle:
  - Preserve the segmented control on mobile (`lg:hidden`), but have it just call `goLogin` / `goSignup` from the controller.
  - Make sure active/inactive button styles stay identical to current behavior.

**6. Clean Up and Organize Code**
- File structure:
  - Option 1: Keep `AnimatedAuth.jsx` as the controller file and move subcomponents into the same file but grouped and ordered (helpers first, then layout, then forms, then main export).
  - Option 2: Move `AuthField`, `PrimaryButton`, `LoginForm`, `SignupForm`, and `DesktopOverlay` into `src/pages/auth/animated_auth/components/` and keep `AnimatedAuth.jsx` as a thin orchestrator.
- Logic cleanup:
  - Remove any duplicated validation or inline magic strings; centralize labels/constants where helpful (e.g., titles, subtitles, button texts).
  - Extract the simulated async logic into a small hook or utility to keep the main component readable.
  - Ensure `useEffect` / timers (like post-signup redirect) are clearly scoped and cleaned up.
- Styling cleanup:
  - Keep Tailwind class names but reorder/group them for readability (layout-related, then colors, then transitions).
  - Check for unused variables or imports and remove them.

**7. Implementation Steps (When Executing)**
- Step 1: Refactor the existing `AnimatedAuth` file without changing any external props or routes:
  - Introduce `LoginForm` and `SignupForm` inside the same file and move form JSX + local state into them.
  - Wire them back into the existing layout, driven by `mode` coming from the controller.
- Step 2: Extract the extracted components into their own files if desired for cleanliness.
- Step 3: Introduce/rename the main component as the explicit controller (`AnimatedAuth` or `AuthController`), simplifying its JSX and focusing on orchestration.
- Step 4: Replace the inline `simulate()` logic with a small `useAuthSimulation` hook or `authService` placeholder to make real API wiring easier later.

**8. Testing and Verification Plan**
- Manual flows:
  - From `/auth/login`, verify all animations when switching to `/auth/signup` and back, both via overlay buttons and mobile segmented control.
  - Confirm that form cross-fades and panel slides are smooth and synchronized (no flicker, no mismatch).
  - Check that the post-signup redirect (if still simulated) correctly navigates to login and plays the appropriate animation.
  - Check behavior on different viewport sizes: mobile, tablet, and desktop.
- Regression checks:
  - Ensure the initial route `/` still redirects to `/auth/login` correctly.
  - Confirm that unknown routes still redirect to `/auth/login`.
  - Verify that there are no console errors or React warnings (especially about keys, unmounted timers, or missing dependencies).

**9. Report and Documentation Output**
- After implementing, provide:
  - A short written report summarizing:
    - Previous state (large monolithic `AnimatedAuth` mixing logic + UI).
    - New structure (controller + dedicated form components + preserved animations).
    - Any behavioral edge cases that were fixed or clarified.
  - A brief walkthrough of each main component and how they collaborate.
  - Notes on where to plug in real authentication API calls for login and signup.
