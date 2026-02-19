# Calculation Engine Specification

This document defines the exact formulas used by `computeScenario(params, scenarioType)` to produce year-by-year cost data.

---

## 1. Scenario Configuration

Each scenario maps to a configuration object:

| Scenario | `basePurchase` | `replaceCycle` | `resalePct` | `insuranceBase` | `maintBase` | `loanTermKey` | `rateKey` |
|----------|---------------|----------------|-------------|-----------------|-------------|---------------|-----------|
| `new4yr` | `newCarPrice` | 4 | `newResalePercent` | `insuranceNew` | `maintNewBase` | `loanTermYears` | `interestRate` |
| `new10yr` | `newCarPrice` | 10 | `newResale10Percent` | `insuranceNew` | `maintNewBase` | `loanTermYears` | `interestRate` |
| `newForever` | `newCarPrice` | ∞ | 0 | `insuranceNew` | `maintNewBase` | `loanTermYears` | `interestRate` |
| `cheapUsed` | `cheapUsedPrice` | 10 | `usedResalePercent` | `insuranceCheapUsed` | `maintCheapUsedBase` | `usedLoanTerm` | `usedInterestRate` |
| `fourYrUsed` | `fourYrUsedPrice` | 10 | `usedResalePercent` | `insurance4yrUsed` | `maint4yrUsedBase` | `usedLoanTerm` | `usedInterestRate` |

---

## 2. Per-Year Computation Loop

For each year `yr` from 1 to `years`:

### 2.1 Inflation Multiplier

```
inflMult = (1 + inflation/100) ^ (yr - 1)
```

All base costs are multiplied by `inflMult` to get current-year dollars.

### 2.2 Vehicle Age

```
if replaceCycle is finite:
  carAge = (yr - 1) mod replaceCycle    // 0-indexed age within current cycle
else:
  carAge = yr - 1                       // continuous age

vehicleAge = startAge + carAge          // total age of the physical vehicle
```

### 2.3 Replacement Detection

```
isReplacementYear = (yr == 1) OR (replaceCycle is finite AND carAge == 0)
```

### 2.4 Purchase Cost (Replacement Years Only)

```
purchasePrice = basePurchase × inflMult
totalPurchase = purchasePrice × (1 + salesTax/100) + regFees × inflMult
```

**Resale credit** (only if yr > 1 and cycle is finite):
```
prevInflMult = (1 + inflation/100) ^ (yr - 1 - replaceCycle)
resaleIncome = basePurchase × max(prevInflMult, 0) × resalePct
```

**Net cash purchase cost:**
```
cashPurchaseCost = totalPurchase - resaleIncome
```

### 2.5 Financing (Replacement Years Only)

```
rateKey = config.interestRateKey   // e.g., "interestRate" or "usedInterestRate"
termKey = config.loanTermKey       // e.g., "loanTermYears" or "usedLoanTerm"

downPayment = totalPurchase × (downPaymentPct / 100)
loanAmount = totalPurchase - downPayment
monthlyRate = (params[rateKey] / 100) / 12
numPayments = params[termKey] × 12

if monthlyRate > 0:
  monthlyPayment = loanAmount × monthlyRate × (1+monthlyRate)^numPayments
                   / ((1+monthlyRate)^numPayments - 1)
  annualPayment = monthlyPayment × 12
else:
  annualPayment = loanAmount / (params[termKey])
```

**Finance cost in replacement year:**
```
financePurchaseCost = downPayment - resaleIncome
```

### 2.6 Loan Payments (Every Year While Balance > 0)

```
interestPortion = loanBalance × (interestRate / 100)
payment = min(annualPayment, loanBalance + interestPortion)
principalPortion = payment - interestPortion
loanBalance = max(0, loanBalance - principalPortion)
```

Finance cost in non-replacement years: `payment` (the annual loan payment)

### 2.7 Insurance

Age-based discount factor:

| Vehicle Age | Factor Parameter | Default |
|-------------|------------------|---------|
| 0–5 | (Base) | 1.0 |
| 6–10 | `insAgeFactor1` | 0.85 |
| 11–15 | `insAgeFactor2` | 0.70 |
| 16+ | `insAgeFactor3` | 0.60 |

```
factor = 1.0
if age >= 16: factor = insAgeFactor3 / 100
else if age >= 11: factor = insAgeFactor2 / 100
else if age >= 6: factor = insAgeFactor1 / 100

insurance = insuranceBase × inflMult × factor
```

### 2.8 Maintenance

```
rawMaintMult = (1 + maintIncreaseRate/100) ^ vehicleAge
maintMult = min(rawMaintMult, maintCapMult)
maintenance = maintBase × inflMult × maintMult
```

The `maintCapMult` (default 8.0) prevents absurd maintenance costs at extreme vehicle ages.

**Maintenance increase rate behavior:**
- At 8%/year: doubles every ~9 years of vehicle age
- A new car at year 1 has multiplier 1.0; at age 10 it's ~2.16×; at age 20 it's ~4.66×; at age 27 it hits the 8× cap

### 2.9 Fuel

```
baseFuel = fuelCostYear × inflMult × config.fuelMult
```

**Special case for `newForever` and `new10yr`:**
If `vehicleAge > 10`, apply a gradual fuel efficiency penalty:
This linearly ramps the penalty from 0% at `fuelPenaltyStart` to the full `fuelPenaltyOld` over `fuelPenaltyRamp` years.

```
yearsOver = vehicleAge - fuelPenaltyStart
if yearsOver > 0:
  rampFactor = min(yearsOver / fuelPenaltyRamp, 1.0)
  fuelAgePenalty = 1 + (fuelPenaltyOld/100) × rampFactor
else:
  fuelAgePenalty = 1.0
```

### 2.10 Annual Registration

```
annualReg = (regFees × (annualRegRate / 100)) × inflMult
```

This models annual registration as a percentage of the one-time fees (default 30%).

### 2.11 Total Annual Cost

```
operatingCosts = insurance + maintenance + fuel + annualReg
cashAnnual = purchaseCost + operatingCosts       // purchaseCost = 0 if not replacement year
financeAnnual = financeCost + operatingCosts      // financeCost = downpay or loan payment
```

### 2.12 Cumulative Total

```
cashCumulative += cashAnnual
financeCumulative += financeAnnual
```

### 2.13 Terminal Value Adjustment (End of Horizon)

If `includeTerminalValue` is true, we credit the residual value of the vehicle at year `years`.

```
endAge = vehicleAge at year `years`
if replaceCycle is finite:
  // Interpolate resale value based on how far into cycle
  cyclePos = (years - 1) % replaceCycle
  // Basic approximation: linear depreciation between Purchase and Resale value
  // Ideally, use the resale logic if it's a replacement year, but for interim years:
  currentBaseVal = basePurchase * inflMult(years)
  // For simplicity in V1: using the RESALE % appropriate for this scenario
  residualValue = currentBaseVal * (resalePct / 100) * ((replaceCycle - cyclePos)/replaceCycle)
else:
  // Keep forever: value is effectively 0 after 15+ years
  residualValue = 0
```

*Note: The exact depreciation curve for interim years is complex. A safe V1 simplification is to treat the asset as having its pro-rated resale value.*

**Adjustment:**
```
cashCumulative -= residualValue
financeCumulative -= residualValue
```

---

## 3. Output Format

For each scenario, the engine returns:

```typescript
{
  cash: Array<{
    year: number,
    annual: number,
    cumulative: number,
    insurance: number,
    maintenance: number,
    fuel: number,
    purchase: number   // net purchase cost, 0 if not replacement year
  }>,
  finance: Array</* same shape */>
}
```

All values are rounded to nearest integer (whole dollars).

---

## 4. Edge Cases & Guards

| Condition | Handling |
|-----------|----------|
| `inflation = 0` | `inflMult` stays 1.0 for all years |
| `interestRate = 0` | Loan divided equally across term |
| `downPaymentPct = 100` | No loan created, finance mode equals cash for purchase |
| `replaceCycle = ∞` (keep forever) | Single purchase at yr 1, no resale events |
| `maintIncreaseRate = 0` | Flat maintenance regardless of vehicle age |
| `prevInflMult < 0` | Clamped to 0 (resale income cannot be negative) |
| `loanBalance = 0` | No further loan payments made |
| Very high vehicle age (30+) | Maintenance capped at 8× base |

---

## 5. Validation Rules

- `cashCumulative` must be monotonically non-decreasing
- `loanBalance` must never go negative
- `maintenance` must never exceed `maintBase × inflMult × 8.0`
- Each scenario over 40 years at defaults should produce a total between $100k and $1M (sanity check)
