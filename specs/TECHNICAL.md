# Technical Specification

## 1. Architecture

### Single-Page Application (SPA)

The application is a client-side-only React application with no backend. All computation happens in the browser. There is no data persistence — the app resets to defaults on reload.

```
┌─────────────────────────────────────────────┐
│                  App Shell                   │
│  ┌────────────┐  ┌───────────────────────┐  │
│  │  Parameter  │  │    Visualization      │  │
│  │  Controls   │  │  ┌─────────────────┐  │  │
│  │             │  │  │  Summary Cards   │  │  │
│  │  [Sliders]  │──│  │  (ranked)        │  │  │
│  │             │  │  ├─────────────────┤  │  │
│  │  3 tabbed   │  │  │  Line Chart     │  │  │
│  │  panels     │  │  │  (recharts)     │  │  │
│  │             │  │  └─────────────────┘  │  │
│  └────────────┘  └───────────────────────┘  │
│  ┌─────────────────────────────────────────┐│
│  │  Calculation Engine (pure functions)     ││
│  │  computeScenario(params, scenarioType)  ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Data Flow

```
User adjusts slider
  → setState(params)
  → useMemo recomputes all 5 scenarios
  → Chart data derived from results + paymentMode + chartType
  → Totals computed, scenarios ranked
  → React re-renders summary cards + chart
```

All computation is memoized. The calculation engine is a pure function with no side effects.

---

## 2. Recommended Stack

### Option A: React (Vite)
- **Framework:** React 18+ with hooks (useState, useMemo, useCallback)
- **Build:** Vite
- **Charting:** Recharts
- **Styling:** Inline styles or CSS Modules (dark theme)
- **Fonts:** DM Sans (UI), JetBrains Mono (numbers)
- **Package Manager:** npm or pnpm

### Option B: React (Next.js Static Export)
- Same React component structure
- Use `next export` for static site generation
- No server-side features needed

### Option C: Vanilla HTML/JS
- Single HTML file with embedded JS
- Use Chart.js instead of Recharts
- Simplest deployment (single file)

**Recommended: Option A** — cleanest DX, easiest to extend, Recharts integrates naturally.

---

## 3. Project Structure

```
car-life-cost/
├── README.md
├── specs/
│   ├── PRD.md
│   ├── TECHNICAL.md
│   ├── CALCULATIONS.md
│   ├── UI_UX.md
│   └── DATA_MODEL.md
├── src/
│   ├── main.jsx                # Entry point
│   ├── App.jsx                 # Root component
│   ├── engine/
│   │   ├── computeScenario.js  # Core calculation function
│   │   ├── constants.js        # Scenario configs, default params
│   │   └── formatters.js       # Currency/number formatting helpers
│   ├── components/
│   │   ├── SummaryCards.jsx     # Ranked cost cards with toggle
│   │   ├── CostChart.jsx       # Recharts line chart wrapper
│   │   ├── ParameterPanel.jsx  # Tabbed slider panel
│   │   ├── SliderInput.jsx     # Reusable slider component
│   │   ├── TabButton.jsx       # Toggle button component
│   │   └── CustomTooltip.jsx   # Chart tooltip
│   └── styles/
│       └── theme.js            # Color palette, design tokens
├── package.json
├── vite.config.js
└── index.html
```

---

## 4. Key Implementation Details

### Calculation Engine

The `computeScenario(params, scenarioType)` function is the heart of the app.

**Input:** Full parameter object + scenario type string  
**Output:** `{ cash: YearData[], finance: YearData[] }`

Where `YearData` is:
```typescript
{
  year: number;
  annual: number;        // Total cost this year
  cumulative: number;    // Running total
  insurance: number;     // Insurance component
  maintenance: number;   // Maintenance component
  fuel: number;          // Fuel component
  purchase: number;      // Net purchase cost (0 in non-replacement years)
}
```

See [CALCULATIONS.md](CALCULATIONS.md) for the full formula specification.

### State Management

Single `useState` hook holding all parameters as a flat object. No external state management library needed — the parameter count (~25) is manageable in a single state object.

```javascript
const [params, setParams] = useState(DEFAULT_PARAMS);
const set = useCallback((key) => (val) => 
  setParams(p => ({ ...p, [key]: val })), []);
```

### Memoization Strategy

```javascript
const results = useMemo(() => ({
  new4yr: computeScenario(params, "new4yr"),
  new10yr: computeScenario(params, "new10yr"),
  newForever: computeScenario(params, "newForever"),
  cheapUsed: computeScenario(params, "cheapUsed"),
  fourYrUsed: computeScenario(params, "fourYrUsed"),
}), [params]);

const chartData = useMemo(() => /* derive from results */, [results, paymentMode, chartType]);
```

### Line Visibility Toggle

```javascript
const [hiddenLines, setHiddenLines] = useState({});
const toggleLine = (key) => setHiddenLines(h => ({ ...h, [key]: !h[key] }));
// Applied via Recharts <Line hide={hiddenLines[key]} />
```

---

## 5. Testing Strategy

### Unit Tests (Vitest)
- `computeScenario` with known inputs → verify year-by-year outputs
- Edge cases: 0% inflation, 100% down payment, 0% interest rate
- Verify maintenance cap at 8× base
- Verify loan balance never goes negative
- Verify cumulative is monotonically increasing

### Snapshot/Visual Tests
- Render summary cards with known data → snapshot
- Render chart with known data → verify axes and legend

### Integration Tests
- Slider change → verify chart data updates
- Payment mode toggle → verify totals change
- Hide/show line toggle → verify chart reflects it

---

## 6. Deployment

Static site — deploy anywhere:
- **Vercel** / **Netlify**: Connect git repo, auto-deploy
- **GitHub Pages**: `vite build` → deploy `dist/`
- **S3 + CloudFront**: Upload `dist/` to bucket

No environment variables, no secrets, no API calls.
