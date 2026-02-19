# Product Requirements Document (PRD)

## 1. Overview

**Product Name:** Car Lifetime Cost Comparator  
**Version:** 1.0  
**Date:** 2026-02-18  

### Problem Statement

Consumers face a recurring financial decision: buy new, buy used, keep a car long-term, or cycle through vehicles on a schedule. The true cost is non-obvious because it involves compounding factors — depreciation, rising maintenance on aging vehicles, financing costs, inflation, and opportunity cost of capital. No readily available tool lets users model all five common strategies side-by-side with adjustable assumptions.

### Target Users

- Individuals making a vehicle purchase decision
- Financial planners advising clients on long-term vehicle costs
- Anyone curious about the economics of car ownership strategies

### Success Criteria

- Users can compare all 5 strategies in under 30 seconds of interaction
- Adjusting any parameter instantly updates all charts and summary cards
- Results are financially reasonable under default parameters (no absurd edge cases)
- The tool is self-explanatory without external documentation

---

## 2. Scenarios

### 2.1 New Every 4 Years
- Purchase a new car at MSRP (inflation-adjusted each cycle)
- Sell/trade-in after 4 years at a configurable resale percentage
- Over 40 years: 10 purchase events
- Maintenance resets to base each cycle (vehicle age 0–4)

### 2.2 New Every 10 Years
- Purchase a new car at MSRP (inflation-adjusted each cycle)
- Sell/trade-in after 10 years at a configurable resale percentage (lower than 4yr)
- Over 40 years: 4 purchase events
- Maintenance accumulates over 10 years before reset

### 2.3 New — Keep Forever
- Single purchase event at year 1
- No resale income, no replacement
- Maintenance compounds aggressively with vehicle age (capped at 8× base)
- Fuel efficiency degrades after year 10
- Insurance decreases as vehicle ages

### 2.4 Cheap Used Every 10 Years
- Purchase a ~8-10 year old car at a low price point (inflation-adjusted)
- Vehicle starts at age 8, driven for 10 years (to age 18)
- Sell at configurable resale percentage, replace with another cheap used
- Higher base maintenance cost, higher fuel penalty
- Over 40 years: 4 purchase events

### 2.5 Four-Year Used Every 10 Years
- Purchase a 4-year-old car (inflation-adjusted)
- Vehicle starts at age 4, driven for 10 years (to age 14)
- Moderate price between new and cheap used
- Moderate maintenance and fuel characteristics
- Over 40 years: 4 purchase events

---

## 3. Functional Requirements

### FR-1: Cost Calculation Engine
- Compute year-by-year costs for each scenario across the full time horizon
- Support both cash and financed payment modes
- Apply inflation to all prices annually
- Model age-dependent maintenance, insurance, and fuel costs
- Apply resale credit at each replacement event
- For financed mode: compute loan amortization with configurable down payment, term, and APR

### FR-2: Interactive Chart
- Line chart showing all 5 scenarios simultaneously
- Toggle between cumulative total and annual cost views
- Toggle between cash and financed modes
- Hover tooltip showing exact values for all scenarios at any year
- Individual line show/hide capability

### FR-3: Summary Cards
- One card per scenario showing: total cost, rank, difference from cheapest, average annual cost
- Auto-sorted by total cost (cheapest first)
- Clickable to toggle line visibility on chart
- Visual indication of which is cheapest

### FR-4: Parameter Controls
- All parameters adjustable via slider inputs with real-time update
- Organized into three tabbed panels: Purchase & Resale, Operating Costs, Finance & Economy
- Each slider shows current value with appropriate formatting (currency, percentage, years)
- Optional description text on key sliders for context

### FR-5: Scenario Detail Footer
- Text summary of each scenario's assumptions
- Dynamic values reflecting current slider positions (e.g., "sell at 45% after 4yr")
- Show number of purchase events per scenario

---

## 4. Non-Functional Requirements

### NFR-1: Performance
- All recalculations must complete in < 50ms for responsive slider interaction
- Chart re-renders must feel instantaneous (no visible lag)

### NFR-2: Usability
- Self-explanatory without documentation
- Mobile-responsive layout
- Accessible slider controls

### NFR-3: Accuracy
- Maintenance capped at 8× base to prevent absurd values at extreme vehicle ages
- Loan balance correctly amortized (no negative balance, no infinite interest)
- Inflation applied consistently across all cost components

---

## 5. Out of Scope (v1)

- Electric vs. ICE comparison (different fuel/maintenance profiles)
- Tax deductions or credits
- Multi-vehicle household modeling
- Detailed depreciation curves (using flat resale percentages instead)
- Regional cost variations (single parameter set)
- Export/share functionality
- Persistent state / saved configurations
