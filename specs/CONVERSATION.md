# Design Conversation Log

This document captures the key decisions and evolution of the design through the iterative conversation that produced this specification.

---

## Turn 1: Initial Scoping

**User request:** Compare total cost of car ownership over 40 years across 3 strategies:
1. Buy new every 4 years and replace
2. Buy cheap used car, replace every 10 years
3. Buy 4-year used car, replace every 10 years

**Response:** Identified the full set of input parameters needed for a useful comparison:

### Parameters Identified
- **Vehicle Costs:** Purchase price per scenario, sales tax, registration fees
- **Financing:** Cash vs. finance, down payment, loan term, interest rate
- **Depreciation & Resale:** Resale value at trade-in for each cycle
- **Ongoing Costs:** Insurance (per scenario), maintenance (base + age increase), fuel (with old-car penalty), annual registration
- **Economic:** Inflation rate, discount rate / opportunity cost
- **Assumptions to clarify:** Same type/price each cycle, age of "cheap used", maintenance reset behavior

---

## Turn 2: Design Decisions

**User decisions:**
- Include both cash and finance cases
- Consider inflation
- Same type and price for replacements (inflation-adjusted)
- Use reasonable defaults, let user override

**Key decision:** User confirmed this is a good candidate for an interactive coding visualization with adjustable inputs.

**First prototype built:** React app with Recharts, 3 scenarios, dark theme dashboard with:
- Summary cards ranked by total cost
- Line chart (cumulative + annual toggle)
- Cash vs. financed toggle
- Three slider panels (Purchase & Resale, Operating Costs, Finance & Economy)

---

## Turn 3: Added Scenario 4

**User request:** Add "buy new car and keep forever" (replace every 0 years)

**Design decisions for "Keep Forever" scenario:**
- Single purchase event at year 1, no replacements
- No resale income
- Maintenance compounds with vehicle age but capped at 8× base to prevent absurd values
- Fuel efficiency degrades after year 10 (gradual ramp to full penalty by year 20)
- Insurance decreases as vehicle ages (added 15+ year tier at 60%)
- Displayed with dashed line to visually distinguish the "no replacement" strategy

---

## Turn 4: Added Scenario 5

**User request:** Add "replace new car every 10 years"

**Design decisions:**
- Separate resale slider for 10-year trade-in (default 20%, lower than 4-year at 45%)
- Same new car insurance and maintenance base as other new-car scenarios
- Fuel penalty applies after year 10 (same as keep-forever)
- Green color (#4ade80) for visual distinction

**UI enhancements added:**
- Cards now auto-sort by total cost (ranked #1 through #5)
- Click any card to show/hide its line on the chart
- Hidden cards dim to 50% opacity
- Title dynamically shows time horizon

---

## Turn 5: Spec Documentation

**User request:** Create spec-driven development documents capturing the full design.

**Documents produced:**
- `README.md` — Project overview and document index
- `specs/PRD.md` — Product requirements with all 5 scenarios, functional and non-functional requirements
- `specs/TECHNICAL.md` — Architecture, stack options, project structure, testing strategy
- `specs/CALCULATIONS.md` — Complete formula specification for the computation engine
- `specs/UI_UX.md` — Full visual design spec: colors, typography, layout, components, interactions
- `specs/DATA_MODEL.md` — All input parameters with defaults, ranges, rationale
- `reference/prototype.jsx` — Working single-file prototype from the conversation

---

## Key Design Principles Established

1. **Pure computation engine** — All financial logic in a single pure function, easy to test and verify
2. **Everything adjustable** — No hardcoded assumptions; all parameters exposed via sliders
3. **Instant feedback** — Memoized computation ensures real-time slider response
4. **Visual hierarchy** — Ranked cards give the answer at a glance; chart provides the detail
5. **Reasonable defaults** — Researched US averages so the tool is useful out of the box
6. **Guard rails** — Maintenance capped at 8×, loan balance can't go negative, edge cases handled
