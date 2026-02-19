
export const DEFAULT_PARAMS = {
  // Purchase & Resale Panel
  newCarPrice: 38000,
  cheapUsedPrice: 8000,
  fourYrUsedPrice: 22000,
  salesTax: 7,
  regFees: 500,
  newResalePercent: 45,
  newResale10Percent: 20,
  usedResalePercent: 15,

  // Operating Costs Panel
  insuranceNew: 2000,
  insuranceCheapUsed: 900,
  insurance4yrUsed: 1400,
  maintNewBase: 400,
  maintCheapUsedBase: 1200,
  maint4yrUsedBase: 800,
  maintIncreaseRate: 8,
  fuelCostYear: 2000,
  fuelPenaltyOld: 15,
  fuelPenaltyStart: 10,
  fuelPenaltyRamp: 10,
  annualRegRate: 30,
  maintCapMult: 8.0,
  insAgeFactor1: 85,
  insAgeFactor2: 70,
  insAgeFactor3: 60,

  // Finance & Economy Panel
  downPaymentPct: 20,
  loanTermYears: 5,
  interestRate: 6.5,
  usedLoanTerm: 4,
  usedInterestRate: 8.5,
  inflation: 3,
  discountRate: 5,
  includeTerminalValue: 1, // 1 = yes, 0 = no
  years: 40,
};

export const PARAM_CONFIGS = [
  // Purchase & Resale
  { key: "newCarPrice", label: "New Car Price", min: 20000, max: 80000, step: 1000, format: "currency", tab: "purchase" },
  { key: "cheapUsedPrice", label: "Cheap Used Car Price", min: 3000, max: 20000, step: 500, format: "currency", tab: "purchase" },
  { key: "fourYrUsedPrice", label: "4-Year Used Car Price", min: 10000, max: 50000, step: 1000, format: "currency", tab: "purchase" },
  { key: "salesTax", label: "Sales Tax", min: 0, max: 12, step: 0.5, format: "percent", tab: "purchase" },
  { key: "regFees", label: "Registration / Fees", min: 100, max: 2000, step: 50, format: "currency", tab: "purchase" },
  { key: "newResalePercent", label: "New Car Resale @ 4yr", min: 10, max: 70, step: 5, format: "percent", tab: "purchase" },
  { key: "newResale10Percent", label: "New Car Resale @ 10yr", min: 5, max: 40, step: 5, format: "percent", tab: "purchase" },
  { key: "usedResalePercent", label: "Used Car Resale @ 10yr", min: 0, max: 40, step: 5, format: "percent", tab: "purchase" },

  // Operating Costs
  { key: "insuranceNew", label: "Insurance — New Car", min: 800, max: 5000, step: 100, format: "currency", tab: "operating" },
  { key: "insuranceCheapUsed", label: "Insurance — Cheap Used", min: 400, max: 3000, step: 100, format: "currency", tab: "operating" },
  { key: "insurance4yrUsed", label: "Insurance — 4yr Used", min: 600, max: 4000, step: 100, format: "currency", tab: "operating" },
  { key: "maintNewBase", label: "Maint — New (base)", min: 100, max: 2000, step: 50, format: "currency", tab: "operating" },
  { key: "maintCheapUsedBase", label: "Maint — Cheap Used (base)", min: 300, max: 4000, step: 100, format: "currency", tab: "operating" },
  { key: "maint4yrUsedBase", label: "Maint — 4yr Used (base)", min: 200, max: 3000, step: 100, format: "currency", tab: "operating" },
  { key: "maintIncreaseRate", label: "Maint Increase/Year", min: 0, max: 20, step: 1, format: "percent", tab: "operating" },
  { key: "maintCapMult", label: "Maint Cap", min: 2.0, max: 15.0, step: 0.5, format: "multiplier", tab: "operating" },
  { key: "fuelCostYear", label: "Annual Fuel Cost", min: 500, max: 5000, step: 100, format: "currency", tab: "operating" },
  { key: "fuelPenaltyOld", label: "Fuel Penalty (old)", min: 0, max: 40, step: 5, format: "percent", tab: "operating" },
  { key: "fuelPenaltyStart", label: "Penalty Start Age", min: 5, max: 20, step: 1, format: "age", tab: "operating" },
  { key: "fuelPenaltyRamp", label: "Penalty Ramp Years", min: 1, max: 20, step: 1, format: "years", tab: "operating" },
  { key: "annualRegRate", label: "Annual Reg. Rate", min: 5, max: 100, step: 5, format: "percent", tab: "operating" },
  { key: "insAgeFactor1", label: "Ins. Factor (Age 6-10)", min: 50, max: 120, step: 5, format: "percent", tab: "operating" },
  { key: "insAgeFactor2", label: "Ins. Factor (Age 11-15)", min: 40, max: 120, step: 5, format: "percent", tab: "operating" },
  { key: "insAgeFactor3", label: "Ins. Factor (Age 16+)", min: 30, max: 120, step: 5, format: "percent", tab: "operating" },

  // Finance & Economy
  { key: "downPaymentPct", label: "Down Payment", min: 0, max: 100, step: 5, format: "percent", tab: "finance" },
  { key: "loanTermYears", label: "Loan Term (New)", min: 2, max: 8, step: 1, format: "years", tab: "finance" },
  { key: "interestRate", label: "Interest Rate (New)", min: 0, max: 15, step: 0.5, format: "percent", tab: "finance" },
  { key: "usedLoanTerm", label: "Loan Term (Used)", min: 2, max: 7, step: 1, format: "years", tab: "finance" },
  { key: "usedInterestRate", label: "Interest Rate (Used)", min: 0, max: 20, step: 0.5, format: "percent", tab: "finance" },
  { key: "inflation", label: "Inflation Rate", min: 0, max: 8, step: 0.5, format: "percent", tab: "finance" },
  { key: "discountRate", label: "Discount Rate", min: 0, max: 10, step: 0.5, format: "percent", tab: "finance" },
  { key: "includeTerminalValue", label: "Include Terminal Value", min: 0, max: 1, step: 1, format: "boolean", tab: "finance" },
  { key: "years", label: "Time Horizon", min: 10, max: 40, step: 5, format: "years", tab: "finance" },
];

export const SCENARIO_CONFIGS = {
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
    fuelMultiplier: "cheapUsed", // Special handler in code
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
    fuelMultiplier: "fourYrUsed", // Special handler in code
  },
};

export const SCENARIOS = [
  { key: "new4yr",     label: "New Every 4yr",       color: "#f59e0b" },
  { key: "new10yr",    label: "New Every 10yr",      color: "#4ade80" },
  { key: "newForever", label: "New — Keep Forever",   color: "#f472b6" },
  { key: "cheapUsed",  label: "Cheap Used / 10yr",   color: "#06b6d4" },
  { key: "fourYrUsed", label: "4yr Used / 10yr",     color: "#a78bfa" },
];
