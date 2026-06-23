# PRD 01 — Meal Plan Feature

Feature folder: `src/features/meal-plan/`. Follows every `CLAUDE.md` rule.

## Input (form)
Fields: `height` (cm), `weight` (kg), `age`, `gender` (male|female), `goal`
(lose_weight | gain_muscle | maintain_weight | improve_health).

Validation — `validations/meal-plan.validation.ts`:
- `GeneratePlanSchema` with `z.coerce.number()` for numeric fields, `z.enum` for gender/goal.
- `GeneratePlanType = z.infer<...>`.
- `WeekPlanSchema` / `DayPlanSchema` / `MealSchema` — used to validate the AI JSON output.

## Output (1-week plan, full detail)
`types/meal-plan.types.ts`:
- `Meal`: name, type (Breakfast/Lunch/Dinner/Snack), calories, protein, carbs, fat,
  ingredients[], steps[].
- `DayPlan`: day, totalCalories, meals[].
- `WeekPlan`: days[] (7).
- `PlanProfile`: height, weight, age, gender, goal.
- `MealPlanResponse`: { plan: WeekPlan; profile: PlanProfile }.
- Store types: `MealPlanState`, `MealPlanActions`, `MealPlanStore`, `MealPlanStoreType`.

## Layers
- `schema/meal-plan.schema.ts` — Mongoose `MealPlanModel`: userId (string, indexed),
  height, weight, age, gender, goal, days (mixed/array), timestamps. `InferSchemaType` + `_id`.
- `repository/meal-plan.repository.ts` — `mongo.connect()` each call; `findLatestByUserId`
  (sort createdAt desc, `.lean()`), `create`, optional `deleteByUserId`. Raw queries only.
- `service/meal-plan.service.ts` — `generatePlanService(userId, input)`:
  build prompt → `openrouter.chatJSON(...)` → `WeekPlanSchema.safeParse` → on fail return
  `{ error: 'GENERATION_FAILED' }, 502` → save via repository → return
  `{ data: MealPlanResponse, status: 201 }`. `getLatestPlanService(userId)` →
  `MealPlanResponse | { error: 'NOT_FOUND' }, 404`. Returns `ServiceResult<T>`, never throws.
- `store/meal-plan-store.ts` — vanilla `createStore` factory (plan, profile, generating, error).
- `hooks/useMealPlanStore.ts` — context + `useStore` + `useShallow` (mirror `useAuthStore`).
- `hooks/use-generate-plan.ts` — action hook: `http.post('/meal-plan', data)`, sets
  generating/plan/profile/error. Also `use-fetch-plan` GET on mount (or fold into one hook).

## Shared
- `shared/lib/openrouter.ts` — class `OpenRouterClient`, singleton `openrouter`. Method
  `chatJSON(system, user)`: POST `${OPENROUTER_BASE_URL}/chat/completions`, headers
  `Authorization: Bearer ${process.env.OPENROUTER_API_KEY}`, model from
  `process.env.OPENROUTER_MODEL ?? OPENROUTER_DEFAULT_MODEL`, `response_format` json,
  returns parsed JSON object. Co-located `shared/lib/openrouter.spec.ts` (mock global fetch).
- `shared/const/openrouter.const.ts` — `OPENROUTER_BASE_URL`, `OPENROUTER_DEFAULT_MODEL`.
- `shared/const/meal-plan.const.ts` — `GENDER_OPTIONS`, `GOAL_OPTIONS`, `WEEK_DAYS`.

## API — `src/app/api/meal-plan/route.ts`
Thin controller. `POST`: `auth()` → 401 if no session; `validateBody(req, GeneratePlanSchema)`;
`generatePlanService(session.user.id, data)`; return JSON. `GET`: `auth()` →
`getLatestPlanService(id)`. Wrap in try/catch → 500.

## UI — `src/app/(protected)/plan/page.tsx` + components
- `components/plan-form.tsx` — react-hook-form + zodResolver(GeneratePlanSchema). Number
  `Input`s for height/weight/age. gender + goal as selectable button groups (no native
  select; wire with `form.setValue`/`form.watch`, validate via `FormField`/`FormMessage`).
  Submit calls `use-generate-plan`. Disabled + "Generating your plan…" while pending.
- `components/plan-display.tsx` — renders `WeekPlan`: 7 `DayPlanCard`s, each `MealCard`s.
  Header shows profile summary + **Regenerate** button (clears plan → form).
- `components/day-plan-card.tsx`, `components/meal-card.tsx`.
- Page is a thin client wrapper using the store: plan ? `<PlanDisplay/>` : `<PlanForm/>`.

## Prompt contract
System: "You are a nutritionist. Return ONLY JSON matching this exact shape …" embed the
WeekPlan shape, require 7 days, realistic calories/macros for the profile + goal, 3 meals +
1 snack per day, ingredients as strings, steps as short imperative strings. User message:
the profile values + goal. Temperature modest. Always parse defensively.
