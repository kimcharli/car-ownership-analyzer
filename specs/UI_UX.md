# UI/UX Specification

## 1. Design Direction

**Aesthetic:** Dark, data-dense dashboard — inspired by financial terminals and analytics tools. Clean without being sterile, information-rich without clutter.

**Theme:** Dark background with high-contrast accent colors per scenario. Monospace numbers for precision feel. Sans-serif labels for readability.

---

## 2. Color Palette

### Background & Surface
| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#0f1117` | Page background |
| `card` | `#1a1d27` | Card/panel backgrounds |
| `cardBorder` | `#2a2d3a` | Card borders |
| `gridLine` | `#1e2130` | Chart grid lines |
| `tooltipBg` | `#1e2130` | Tooltip background |

### Scenario Accent Colors
| Scenario | Color | Value |
|----------|-------|-------|
| New Every 4yr | Amber | `#f59e0b` |
| New Every 10yr | Green | `#4ade80` |
| New — Keep Forever | Pink | `#f472b6` |
| Cheap Used / 10yr | Cyan | `#06b6d4` |
| 4yr Used / 10yr | Purple | `#a78bfa` |

### Text
| Token | Value | Usage |
|-------|-------|-------|
| `text` | `#e2e8f0` | Primary text |
| `textMuted` | `#94a3b8` | Labels, secondary text |
| `textDim` | `#64748b` | Tertiary, footnotes |

### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#22c55e` | "Lowest cost" indicator, #1 rank |

---

## 3. Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Page title | DM Sans | 700 | 26px |
| Subtitle | DM Sans | 400 | 14px |
| Card label | DM Sans | 400 | 11px |
| Card total | JetBrains Mono | 700 | 19-20px |
| Slider label | DM Sans | 400 | 13px |
| Slider value | JetBrains Mono | 600 | 15px |
| Chart tick | JetBrains Mono | 400 | 11px |
| Tooltip label | DM Sans | 400 | 13px |
| Tooltip value | JetBrains Mono | 600 | 13px |
| Footnote | DM Sans | 400 | 11px |

**Font loading:** Google Fonts CDN
```
DM Sans: weights 400, 500, 600, 700
JetBrains Mono: weights 400, 600
```

---

## 4. Layout

### Page Structure (Top to Bottom)

```
┌─────────────────────────────────────┐
│          Header (centered)          │
│   Title + subtitle                  │
├─────────────────────────────────────┤
│  [Card] [Card] [Card] [Card] [Card] │  ← Summary cards (flex, ranked)
├─────────────────────────────────────┤
│  [Cash|Financed]  [Cumulative|Annual]│  ← Chart controls
├─────────────────────────────────────┤
│                                     │
│          Line Chart                 │
│          (400px height)             │
│                                     │
├─────────────────────────────────────┤
│  [Purchase|Operating|Finance] tabs   │
│  ┌──────────┐  ┌──────────┐        │
│  │ Slider   │  │ Slider   │        │  ← 2-column grid
│  │ Slider   │  │ Slider   │        │
│  │ Slider   │  │ Slider   │        │
│  └──────────┘  └──────────┘        │
├─────────────────────────────────────┤
│  Scenario Details / Assumptions      │
└─────────────────────────────────────┘
```

**Max width:** 1200px, centered  
**Padding:** 24px vertical, 20px horizontal  
**Card gap:** 8px  
**Section gap:** 20px  

---

## 5. Component Specifications

### 5.1 Summary Cards

- **Layout:** Flex row, equal width, wrap on narrow screens (min-width: 170px)
- **Sort order:** Ascending by total cost (cheapest first)
- **Border:** 1px `cardBorder`, with 3px top border in scenario accent color
- **Content:**
  - Label (11px, muted)
  - Total cost (19px, monospace, accent color)
  - Rank badge (#1, #2, etc.) — top-right corner, #1 gets green background
  - Difference from cheapest ("✓ Lowest" or "+$XXX")
  - Average annual cost (10px, dim)
- **Interaction:** Click to toggle line visibility on chart
  - Hidden state: 50% opacity, border changes to dim, accent color grayed out
  - Cursor: pointer
  - Transition: 0.2s all

### 5.2 Chart Controls

- **Layout:** Horizontal flex with two button groups, gap between groups
- **Button style:** `TabButton` — pill-shaped, 8px 18px padding, 8px border-radius
  - Active: accent color + 18% opacity background, accent border and text
  - Inactive: transparent background, cardBorder border, muted text
- **Groups:**
  - Payment mode: Cash | Financed
  - Chart type: Cumulative | Annual

### 5.3 Line Chart

- **Library:** Recharts `<LineChart>`
- **Container:** 100% width, 400px height inside a card
- **Grid:** Dashed 3px, `gridLine` color
- **Axes:**
  - X: Year (1 to N), monospace font, labeled "Year"
  - Y: Auto-scaled, formatted with `$XXk` / `$X.XM`, monospace font
- **Lines:**
  - 2.5px stroke width, no dots
  - "Keep Forever" line uses `strokeDasharray="8 4"` (dashed) for visual distinction
  - Hidden lines use Recharts `hide` prop
- **Tooltip:** Custom component
  - Dark background, rounded corners, shadow
  - Shows year label + all scenario values
  - Values in monospace with full dollar formatting
- **Legend:** Below chart, 11px font, 8px top padding

### 5.4 Parameter Panel

- **Container:** Card with tabbed navigation
- **Tabs:** Three TabButtons — Purchase & Resale, Operating Costs, Finance & Economy
- **Content:** 2-column CSS grid, 24px column gap
- **Each slider:**
  - Label (left) + value (right, monospace) on top row
  - Optional description text (11px, dim) below label row
  - Native `<input type="range">` with accent color
  - Full width, 6px height track

### 5.5 Scenario Detail Footer

- **Container:** Card at bottom
- **Header:** "Scenario Details" (12px, semibold, muted)
- **Content:** 2-column grid, 11px text, dim color
- **Each line:** Bullet + scenario name in accent color (bold) + description
- **Dynamic values:** Reflect current slider positions

---

## 6. Interactions

### Slider → Instant Recalculation
- `onChange` fires on every value change (continuous, not on-release)
- All 5 scenarios recompute via `useMemo`
- Chart + cards update in same render cycle
- Target: < 50ms total computation time

### Card Click → Toggle Line
- Clicking a summary card toggles `hiddenLines[scenarioKey]`
- Chart line hides/shows immediately
- Card dims to 50% opacity when hidden
- Multiple lines can be hidden simultaneously

### Tab Switch → Panel Swap
- Parameter panel tabs switch content instantly (no animation)
- Only one panel visible at a time

### Payment Mode Toggle
- Switches between `cash` and `finance` data arrays
- Totals, rankings, and chart all update
- The underlying computation already produces both — no recalculation needed

### Chart Type Toggle
- Switches between `cumulative` and `annual` keys in chart data
- Y-axis auto-rescales

---

## 7. Responsive Behavior

### Desktop (> 900px)
- Full 5-card row
- 2-column parameter grid
- Chart at 400px height

### Tablet (600–900px)
- Cards wrap to 2 rows (3 + 2)
- 2-column parameter grid maintained
- Chart height maintained

### Mobile (< 600px)
- Cards stack vertically (1 per row)
- Parameter grid collapses to 1 column
- Chart height reduces to 280px
- Tab buttons wrap if needed

---

## 8. Number Formatting

| Context | Format | Examples |
|---------|--------|---------|
| Card totals | Full comma-separated | `$347,212` |
| Card difference | Full with + prefix | `+$82,450` |
| Card avg/yr | Full comma-separated | `$8,680/yr` |
| Y-axis ticks | Abbreviated | `$50k`, `$1.2M` |
| Tooltip values | Full comma-separated | `$347,212` |
| Slider values (currency) | Full comma-separated | `$38,000` |
| Slider values (percent) | Plain number + suffix | `7%` |
| Slider values (years) | Plain number + suffix | `5 years` |
