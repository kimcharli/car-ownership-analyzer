# Calculation Engine Specification

This document defines the exact formulas used by `computeScenario(params, scenarioType)` to produce year-by-year cost data.

---

## 1. Scenario Configuration

Each scenario maps to a configuration object:

| Scenario | `basePurchase` | `replaceCycle` | `resalePct` | `insuranceBase` | `maintBase` | `startAge` | `fuelMult` |
|----------|---------------|----------------|-------------|-----------------|-------------|------------|------------|
| `new4yr` | `newCarPrice` | 4 | `newResalePercent / 100` | `insuranceNew` | `maintNewBase` | 0 | 1.0 |
| `new10yr` | `newCarPrice` | 10 | `newResale10Percent / 100` | `insuranceNew` | `maintNewBase` | 0 | 1.0 |
| `newForever` | `newCarPrice` | ∞ | 0 | `insuranceNew` | `maintNewBase` | 0 | 1.0 |
| `cheapUsed` | `cheapUsedPrice` | 10 | `usedResalePercent / 100` | `insuranceCheapUsed` | `maintCheapUsedBase` | 8 | `1 + fuelPenaltyOld/100` |
| `fourYrUsed` | `fourYrUsedPrice` | 10 | `usedResalePercent / 100` | `insurance4yrUsed` | `maint4yrUsedBase` | 4 | `1 + fuelPenaltyOld/200` |

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
downPayment = totalPurchase × (downPaymentPct / 100)
loanAmount = totalPurchase - downPayment
monthlyRate = (interestRate / 100) / 12
numPayments = loanTermYears × 12

if monthlyRate > 0:
  monthlyPayment = loanAmount × monthlyRate × (1+monthlyRate)^numPayments
                   / ((1+monthlyRate)^numPayments - 1)
  annualPayment = monthlyPayment × 12
else:
  annualPayment = loanAmount / loanTermYears
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

| Vehicle Age | Factor |
|-------------|--------|
| 0–5 | 1.0 |
| 6–10 | 0.85 |
| 11–15 | 0.70 |
| 16+ | 0.60 |

```
insurance = insuranceBase × inflMult × ageFactor
```

### 2.8 Maintenance

```
rawMaintMult = (1 + maintIncreaseRate/100) ^ vehicleAge
maintMult = min(rawMaintMult, 8.0)    // cap at 8× base
maintenance = maintBase × inflMult × maintMult
```

The 8× cap prevents absurd maintenance costs at extreme vehicle ages (e.g., a 40-year-old car).

**Maintenance increase rate behavior:**
- At 8%/year: doubles every ~9 years of vehicle age
- A new car at year 1 has multiplier 1.0; at age 10 it's ~2.16×; at age 20 it's ~4.66×; at age 27 it hits the 8× cap

### 2.9 Fuel

```
baseFuel = fuelCostYear × inflMult × config.fuelMult
```

**Special case for `newForever` and `new10yr`:**
If `vehicleAge > 10`, apply a gradual fuel efficiency penalty:
```
fuelAgePenalty = 1 + (fuelPenaltyOld/100) × min((vehicleAge - 10) / 10, 1.0)
fuel = fuelCostYear × inflMult × fuelAgePenalty
```

This linearly ramps the penalty from 0% at age 10 to the full `fuelPenaltyOld` at age 20+.

### 2.10 Annual Registration

```
annualReg = (regFees × 0.3) × inflMult
```

This models annual registration as 30% of the one-time registration fee, inflation-adjusted.

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
