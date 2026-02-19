# Data Model & Parameters

## 1. Input Parameters

All parameters are stored in a single flat state object. Every parameter has a default value, valid range, step increment, and display format.

### Purchase & Resale Panel

| Key | Label | Default | Min | Max | Step | Format | Description |
|-----|-------|---------|-----|-----|------|--------|-------------|
| `newCarPrice` | New Car Price | 38,000 | 20,000 | 80,000 | 1,000 | `$XX,XXX` | Base MSRP in today's dollars |
| `cheapUsedPrice` | Cheap Used Car Price | 8,000 | 3,000 | 20,000 | 500 | `$XX,XXX` | ~8-10 year old vehicle |
| `fourYrUsedPrice` | 4-Year Used Car Price | 22,000 | 10,000 | 50,000 | 1,000 | `$XX,XXX` | |
| `salesTax` | Sales Tax | 7 | 0 | 12 | 0.5 | `X%` | Applied to purchase price |
| `regFees` | Registration / Fees | 500 | 100 | 2,000 | 50 | `$XXX` | One-time per purchase |
| `newResalePercent` | New Car Resale @ 4yr | 45 | 10 | 70 | 5 | `X%` | % of purchase price at 4yr trade-in |
| `newResale10Percent` | New Car Resale @ 10yr | 20 | 5 | 40 | 5 | `X%` | % of purchase price at 10yr trade-in |
| `usedResalePercent` | Used Car Resale @ 10yr | 15 | 0 | 40 | 5 | `X%` | % of purchase price for used cars |

### Operating Costs Panel

| Key | Label | Default | Min | Max | Step | Format | Description |
|-----|-------|---------|-----|-----|------|--------|-------------|
| `insuranceNew` | Insurance — New Car | 2,000 | 800 | 5,000 | 100 | `$X,XXX/yr` | Annual premium for new vehicle |
| `insuranceCheapUsed` | Insurance — Cheap Used | 900 | 400 | 3,000 | 100 | `$X,XXX/yr` | Annual premium for cheap used |
| `insurance4yrUsed` | Insurance — 4yr Used | 1,400 | 600 | 4,000 | 100 | `$X,XXX/yr` | Annual premium for 4yr used |
| `maintNewBase` | Maintenance — New (base) | 400 | 100 | 2,000 | 50 | `$XXX/yr` | Year-1 maintenance for new car |
| `maintCheapUsedBase` | Maintenance — Cheap Used (base) | 1,200 | 300 | 4,000 | 100 | `$X,XXX/yr` | Base maintenance for cheap used |
| `maint4yrUsedBase` | Maintenance — 4yr Used (base) | 800 | 200 | 3,000 | 100 | `$XXX/yr` | Base maintenance for 4yr used |
| `maintIncreaseRate` | Maintenance Increase / Year of Age | 8 | 0 | 20 | 1 | `X%` | Compounds per year of vehicle age (capped at 8×) |
| `fuelCostYear` | Annual Fuel Cost | 2,000 | 500 | 5,000 | 100 | `$X,XXX` | Base annual fuel in today's dollars |
| `fuelPenaltyOld` | Fuel Penalty (old vehicles) | 15 | 0 | 40 | 5 | `X%` | Extra fuel cost for old/inefficient cars |
| `fuelPenaltyStart` | Fuel Penalty Start Age | 10 | 5 | 20 | 1 | `Age X` | Vehicle age when efficiency begins detecting |
| `fuelPenaltyRamp` | Fuel Penalty Ramp Years | 10 | 1 | 20 | 1 | `X years` | Years to reach full penalty |
| `annualRegRate` | Annual Reg. Rate | 30 | 5 | 100 | 5 | `X%` | Annual registration as % of initial fees |
| `maintCapMult` | Maintenance Cap | 8.0 | 2.0 | 15.0 | 0.5 | `X.X×` | Max multiplier for age-based maintenance |
| `insAgeFactor1` | Ins. Factor (Age 6-10) | 85 | 50 | 120 | 5 | `X%` | Multiplier for vehicle age 6-10 |
| `insAgeFactor2` | Ins. Factor (Age 11-15) | 70 | 40 | 120 | 5 | `X%` | Multiplier for vehicle age 11-15 |
| `insAgeFactor3` | Ins. Factor (Age 16+) | 60 | 30 | 120 | 5 | `X%` | Multiplier for vehicle age 16+ |

### Finance & Economy Panel

| Key | Label | Default | Min | Max | Step | Format | Description |
|-----|-------|---------|-----|-----|------|--------|-------------|
| `downPaymentPct` | Down Payment | 20 | 0 | 100 | 5 | `X%` | Set to 100% for cash-equivalent |
| `loanTermYears` | Loan Term (New) | 5 | 2 | 8 | 1 | `X years` | |
| `interestRate` | Interest Rate (New) | 6.5 | 0 | 15 | 0.5 | `X%` | APR for new cars |
| `usedLoanTerm` | Loan Term (Used) | 4 | 2 | 7 | 1 | `X years` | |
| `usedInterestRate` | Interest Rate (Used) | 8.5 | 0 | 20 | 0.5 | `X%` | APR for used cars (typically higher) |
| `inflation` | Inflation Rate | 3 | 0 | 8 | 0.5 | `X%` | Applied to all costs annually |
| `discountRate` | Discount Rate | 5 | 0 | 10 | 0.5 | `X%` | Opportunity cost of capital (reserved for future NPV) |
| `includeTerminalValue` | Include Terminal Value | 1 | 0 | 1 | 1 | `Yes/No` | Subtract final asset value from total cost |
| `years` | Time Horizon | 40 | 10 | 40 | 5 | `X years` | |

---

## 2. Default Parameter Rationale

| Parameter | Default | Rationale |
|-----------|---------|-----------|
| New car price: $38,000 | Average new car transaction price in the US (~$48k in 2024, adjusted for mid-range) |
| Cheap used: $8,000 | Typical price for a reliable 8-10 year old sedan (Camry, Civic, etc.) |
| 4yr used: $22,000 | ~58% of new car price, consistent with typical 4-year depreciation |
| Sales tax: 7% | Near US average (ranges 0-10.25% by state) |
| New resale @ 4yr: 45% | Average 4-year retention; trucks/SUVs higher, sedans lower |
| New resale @ 10yr: 20% | Significant depreciation; most cars worth 15-25% at 10 years |
| Used resale @ 10yr: 15% | Low but non-zero; an 18-year-old car has minimal value |
| Insurance new: $2,000/yr | US average full-coverage is ~$2,300; $2,000 is moderate |
| Insurance cheap used: $900/yr | Liability-only or minimal coverage on low-value vehicle |
| Insurance 4yr used: $1,400/yr | Full coverage but lower premiums than brand new |
| Maint new base: $400/yr | Oil changes, filters, tires prorated — low for first few years |
| Maint cheap used base: $1,200/yr | Older car starts with higher baseline repair needs |
| Maint 4yr used base: $800/yr | Moderate — warranty may still cover some items |
| Maint increase: 8%/yr | Conservative compound; major systems fail in staggered fashion |
| Maint Cap: 8.0× | Prevent unreasonable costs for 30+ year old vehicles |
| Fuel: $2,000/yr | ~12,000 mi/yr × 30 MPG × $5/gal ≈ $2,000 |
| Fuel penalty: 15% | Older cars 10-20% less fuel efficient |
| Fuel start/ramp: 10yr/10yr | Efficiency loss typically starts after partial useful life, gradual |
| Down payment: 20% | Common rule of thumb |
| Loan term (New): 5 years | Most common auto loan term |
| Interest rate (New): 6.5% | Approximate 2024-2025 average new car APR |
| Loan term (Used): 4 years | Used loans often shorter term |
| Interest rate (Used): 8.5% | Used car rates typically 1-3% higher than new |
| Inflation: 3% | Slightly above long-run US average of ~2.5% |
| Discount rate: 5% | Moderate opportunity cost (stock market avg minus inflation) |

---

## 3. Scenario Configuration Map

```javascript
const SCENARIO_CONFIGS = {
  new4yr: {
    basePurchase: "newCarPrice",
    replaceCycle: 4,
    resaleKey: "newResalePercent",
    insuranceKey: "insuranceNew",
    maintKey: "maintNewBase",
    loanTermKey: "loanTermYears",
    interestRateKey: "interestRate",
    startAge: 0,
    fuelMultiplier: 1.0,
  },
  new10yr: {
    basePurchase: "newCarPrice",
    replaceCycle: 10,
    resaleKey: "newResale10Percent",
    insuranceKey: "insuranceNew",
    maintKey: "maintNewBase",
    loanTermKey: "loanTermYears",
    interestRateKey: "interestRate",
    startAge: 0,
    fuelMultiplier: 1.0,
  },
  newForever: {
    basePurchase: "newCarPrice",
    replaceCycle: Infinity,
    resaleKey: null,
    insuranceKey: "insuranceNew",
    maintKey: "maintNewBase",
    loanTermKey: "loanTermYears",
    interestRateKey: "interestRate",
    startAge: 0,
    fuelMultiplier: 1.0,
  },
  cheapUsed: {
    basePurchase: "cheapUsedPrice",
    replaceCycle: 10,
    resaleKey: "usedResalePercent",
    insuranceKey: "insuranceCheapUsed",
    maintKey: "maintCheapUsedBase",
    loanTermKey: "usedLoanTerm",
    interestRateKey: "usedInterestRate",
    startAge: 8,
    fuelMultiplier: "1 + fuelPenaltyOld/100",
  },
  fourYrUsed: {
    basePurchase: "fourYrUsedPrice",
    replaceCycle: 10,
    resaleKey: "usedResalePercent",
    insuranceKey: "insurance4yrUsed",
    maintKey: "maint4yrUsedBase",
    loanTermKey: "usedLoanTerm",
    interestRateKey: "usedInterestRate",
    startAge: 4,
    fuelMultiplier: "1 + fuelPenaltyOld/200",
  },
};
```

---

## 4. Display Metadata

```javascript
const SCENARIOS = [
  { key: "new4yr",     label: "New Every 4yr",       color: "#f59e0b" },
  { key: "new10yr",    label: "New Every 10yr",      color: "#4ade80" },
  { key: "newForever", label: "New — Keep Forever",   color: "#f472b6" },
  { key: "cheapUsed",  label: "Cheap Used / 10yr",   color: "#06b6d4" },
  { key: "fourYrUsed", label: "4yr Used / 10yr",     color: "#a78bfa" },
];

const CHART_LINES = [
  { dataKey: "New Every 4yr",       color: "#f59e0b", dash: null     },
  { dataKey: "New Every 10yr",      color: "#4ade80", dash: null     },
  { dataKey: "New — Keep Forever",  color: "#f472b6", dash: "8 4"   },
  { dataKey: "Cheap Used / 10yr",   color: "#06b6d4", dash: null     },
  { dataKey: "4yr Used / 10yr",     color: "#a78bfa", dash: null     },
];
```

---

## 5. UI State (Not Persisted)

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `paymentMode` | `"cash" \| "finance"` | `"cash"` | Which cost array to display |
| `chartType` | `"cumulative" \| "annual"` | `"cumulative"` | Which data key to chart |
| `showPanel` | `"purchase" \| "operating" \| "finance"` | `"purchase"` | Active parameter tab |
| `hiddenLines` | `Record<string, boolean>` | `{}` | Which scenario lines are hidden |

---

## 6. Computed / Derived Data

These are not stored — they are computed from `results` + `params`:

| Value | Derivation |
|-------|-----------|
| `totals[key]` | `results[key][paymentMode][years-1].cumulative` |
| `minTotal` | `Math.min(...Object.values(totals))` |
| `ranked` | `SCENARIOS sorted by totals[key] ascending` |
| `chartData` | Array of `{ year, ...scenarioValues }` mapped from results |
| Average annual | `totals[key] / params.years` |
| Difference from best | `totals[key] - minTotal` |
