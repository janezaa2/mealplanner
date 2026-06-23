# PRD 00 — Meal Planner Overview

## Product
AI meal planner built on the existing Next.js 16 feature-based starter. Registered users
enter biometrics + a fitness goal, click **Generate plan**, and an OpenRouter model returns
a structured 1-week meal plan (full detail: ingredients, calories, macros, recipe steps).
The public home page carries a sticky Shopify product promo banner overlaying all content.

## Tech (inherited)
Next.js 16 App Router, NextAuth v5 (JWT), Mongoose, Zustand (vanilla + context), Zod +
react-hook-form, Tailwind + shadcn/ui, Vitest. All architecture rules in `CLAUDE.md` apply
verbatim — feature-based folders, `type` only (no `interface`), `@/` imports, no inline
styles, no arbitrary Tailwind values, services return `ServiceResult<T>`, repositories are
the only Mongoose layer, every `shared/lib/*` file has a co-located `.spec.ts`.

## User flow
1. `/sign-up` → register (existing) → redirect `/sign-in`.
2. `/sign-in` → login (existing) → redirect **`/plan`** (was `/` for non-admins).
3. `/plan` (protected, any authenticated role): if no saved plan → show biometric form.
4. Submit form → `POST /api/meal-plan` → OpenRouter → save → render week plan.
5. Returning user with a saved plan → plan renders, with **Regenerate** to redo the form.

## Cross-cutting changes
- `src/proxy.ts` + `routes.const.ts`: add `/plan` to protected routes + matcher.
- `(protected)/layout.tsx`: relax admin-only gate to any authenticated session
  (meal plan is a user feature; dashboard stays reachable but is no longer admin-walled).
- `use-login.ts`: non-admin redirect target `/` → `/plan`.
- `header.tsx`: add "My Plan" link for any logged-in user.
- `.env` / `.env.example`: add `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`.
- `next.config.ts`: allow `cdn.shopify.com` + `images.unsplash.com` remote images.

## Model
OpenRouter, default `deepseek/deepseek-chat-v3-0324` (override via `OPENROUTER_MODEL`).
Key supplied later via `OPENROUTER_API_KEY` — code reads it at request time, never hardcoded.

## Out of scope (v1)
Payments, real Shopify Storefront API (banner is static const the user fills in), plan
editing per-meal, shopping-list export, nutrition tracking over time.

## Build order
Contracts (types/validations/consts) → wiring → 3 parallel feature slices
(backend, frontend, banner) → typecheck + lint + build.
