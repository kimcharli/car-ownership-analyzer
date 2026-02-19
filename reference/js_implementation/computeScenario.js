import { SCENARIO_CONFIGS } from "./constants";

/**
 * Computes year-by-year cost data for a specific scenario.
 * @param {Object} params - The full state object of parameters
 * @param {String} scenarioKey - One of the keys in SCENARIO_CONFIGS (e.g., "new4yr")
 * @returns {Object} { cash: Array, finance: Array }
 */
export function computeScenario(params, scenarioKey) {
    const config = SCENARIO_CONFIGS[scenarioKey];
    if (!config) throw new Error(`Unknown scenario: ${scenarioKey}`);

    const cashData = [];
    const financeData = [];

    // State state variables
    let cashCumulative = 0;
    let financeCumulative = 0;

    // Finance specific state
    let loanBalance = 0;
    let currentAnnualPayment = 0;
    let currentLoanTerm = 0; // To track when loan ends if we just count years?
    // Better: calculate payment based on balance and original terms as we go.

    // Helper to get param value safely
    const p = (key) => params[key];

    for (let yr = 1; yr <= params.years; yr++) {
        const inflMult = Math.pow(1 + p("inflation") / 100, yr - 1);

        // --- 1. Vehicle Age ---
        let carAge;
        if (config.replaceCycle === Infinity) {
            carAge = yr - 1;
        } else {
            carAge = (yr - 1) % config.replaceCycle;
        }
        const vehicleAge = config.startAge + carAge;

        // --- 2. Replacement Detection ---
        const isReplacementYear = (yr === 1) || (config.replaceCycle !== Infinity && carAge === 0);

        // --- 3. Purchase & Finance Logic in Replacement Year ---
        let cashPurchaseCost = 0;   // Net cash cost for Cash Mode
        let financeDirectCost = 0;  // Down payment - Trade-in (Net out of pocket)

        if (isReplacementYear) {
            const basePrice = p(config.basePurchase);
            const purchasePrice = basePrice * inflMult;
            const totalPurchase = purchasePrice * (1 + p("salesTax") / 100) + p("regFees") * inflMult;

            // Resale Income from previous car
            let resaleIncome = 0;
            if (yr > 1) {
                // Spec: prevInflMult based on when the PREVIOUS car was bought
                // The previous car was bought `replaceCycle` years ago.
                const cyclesPassed = Math.floor((yr - 1) / config.replaceCycle); // How many full cycles
                // Actually, precise inflation of the PREVIOUS purchase year:
                const prevPurchaseYear = yr - config.replaceCycle;
                const prevInflMult = Math.pow(1 + p("inflation") / 100, prevPurchaseYear - 1);

                const resalePct = p(config.resaleKey);
                resaleIncome = p(config.basePurchase) * prevInflMult * (resalePct / 100);
            }

            // --- Cash Mode Transaction ---
            cashPurchaseCost = totalPurchase - resaleIncome;

            // --- Finance Mode Transaction ---
            // 1. Clear old loan? 
            // Assumption: Trade-in value covers remaining loan balance or loan is paid off.
            // If loanBalance > 0, we subtract it from Resale Income (reducing equity).
            const netEquity = resaleIncome - loanBalance;

            // Reset loan from previous cycle
            loanBalance = 0;
            currentAnnualPayment = 0;

            // 2. Buy new car
            if (p("downPaymentPct") >= 100) {
                // Full cash purchase in finance mode (effectively cash mode)
                financeDirectCost = totalPurchase - netEquity;
                loanBalance = 0;
            } else {
                const downPaymentAmount = totalPurchase * (p("downPaymentPct") / 100);

                // Out of pocket = Down Payment - Net Equity
                // If Equity > Down Payment, we have surplus cash? (Negative cost). Yes.
                financeDirectCost = downPaymentAmount - netEquity;

                // Verify: Net Equity = Resale - OldLoan.
                // DirectCost = DownPay - (Resale - OldLoan) = DownPay + OldLoan - Resale. Correct.

                const amountToFinance = totalPurchase - downPaymentAmount;

                const rateKey = config.interestRateKey || "interestRate";
                const termKey = config.loanTermKey || "loanTermYears";
                const rateVal = p(rateKey);
                const termVal = p(termKey);

                const monthlyRate = (rateVal / 100) / 12;
                const numPayments = termVal * 12;

                if (monthlyRate > 0) {
                    const monthlyPayment = amountToFinance * monthlyRate * Math.pow(1 + monthlyRate, numPayments)
                        / (Math.pow(1 + monthlyRate, numPayments) - 1);
                    currentAnnualPayment = monthlyPayment * 12;
                } else {
                    currentAnnualPayment = amountToFinance / termVal;
                }

                loanBalance = amountToFinance;
            }
        }

        // --- 4. Loan Payments (Finance Mode) ---
        // Payment happens in replacement year too (monthly payments start immediately)
        let financeLoanPayment = 0;

        if (loanBalance > 0) {
            // Calculate interest for this year
            const rateKey = config.interestRateKey || "interestRate";
            const annualInterest = loanBalance * (p(rateKey) / 100);

            // Payment is min of scheduled annual payment OR (balance + interest)
            const payment = Math.min(currentAnnualPayment, loanBalance + annualInterest);

            // Amortize
            const principal = payment - annualInterest;
            loanBalance = Math.max(0, loanBalance - principal);

            financeLoanPayment = payment;
        }

        // --- 5. Operating Costs ---

        // Insurance
        let insFactor = 1.0;
        if (vehicleAge >= 16) insFactor = p("insAgeFactor3") / 100;
        else if (vehicleAge >= 11) insFactor = p("insAgeFactor2") / 100;
        else if (vehicleAge >= 6) insFactor = p("insAgeFactor1") / 100;
        const insurance = p(config.insuranceKey) * inflMult * insFactor;

        // Maintenance
        const rawMaintMult = Math.pow(1 + p("maintIncreaseRate") / 100, vehicleAge);
        const maintMult = Math.min(rawMaintMult, p("maintCapMult"));
        const maintenance = p(config.maintKey) * inflMult * maintMult;

        // Fuel
        let fuelPenalty = 1.0;
        if (config.fuelMultiplier === "cheapUsed" || config.fuelMultiplier === "fourYrUsed") {
            // simplified string check as defined in constants
            const penaltyBase = p("fuelPenaltyOld") / 100;
            const factor = (scenarioKey === "cheapUsed") ? 1.0 : (scenarioKey === "fourYrUsed" ? 0.5 : 1.0);
            fuelPenalty = 1 + penaltyBase * factor;
        } else {
            // Ramp logic
            const startAge = p("fuelPenaltyStart");
            const rampYears = p("fuelPenaltyRamp");
            const yearsOver = vehicleAge - startAge;
            if (yearsOver > 0) {
                const penaltyMax = p("fuelPenaltyOld") / 100;
                const rampFactor = Math.min(yearsOver / rampYears, 1.0);
                fuelPenalty = 1 + penaltyMax * rampFactor;
            }
        }
        const fuel = p("fuelCostYear") * inflMult * fuelPenalty;

        // Registration
        const annualReg = (p("regFees") * (p("annualRegRate") / 100)) * inflMult;

        // Totals
        const operatingTotal = insurance + maintenance + fuel + annualReg;

        const cashAnnual = cashPurchaseCost + operatingTotal;
        const financeAnnual = financeDirectCost + financeLoanPayment + operatingTotal;

        cashCumulative += cashAnnual;
        financeCumulative += financeAnnual;

        // Record Data
        cashData.push({
            year: yr,
            annual: Math.round(cashAnnual),
            cumulative: Math.round(cashCumulative),
            insurance: Math.round(insurance),
            maintenance: Math.round(maintenance),
            fuel: Math.round(fuel),
            purchase: Math.round(cashPurchaseCost),
        });

        financeData.push({
            year: yr,
            annual: Math.round(financeAnnual),
            cumulative: Math.round(financeCumulative),
            insurance: Math.round(insurance),
            maintenance: Math.round(maintenance),
            fuel: Math.round(fuel),
            purchase: Math.round(financeDirectCost + financeLoanPayment),
        });
    }

    // --- Terminal Value Adjustment ---
    if (p("includeTerminalValue") === 1) {
        let residualValue = 0;
        const finalYr = params.years;
        const inflMultFinal = Math.pow(1 + p("inflation") / 100, finalYr - 1);

        if (config.replaceCycle !== Infinity) {
            const currentBaseVal = p(config.basePurchase) * inflMultFinal;
            const resalePct = p(config.resaleKey) / 100;
            const endValue = currentBaseVal * resalePct;

            const cyclePos = (finalYr - 1) % config.replaceCycle;
            // Linear depreciation from currentBaseVal (at pos 0) to endValue (at pos replaceCycle)

            // Value(t) = Purchase + (Resale - Purchase) * (t / Cycle)
            //          = Purchase * (1 - (1 - ResalePct) * (t / Cycle))

            // HOWEVER: t here is `cyclePos`? 
            // At year 1 (cyclePos 0): It is brand new. Value = Purchase.
            // At year 4 (cyclePos 3): It is 3 years old. 
            // At year 5 replacement (cyclePos 4): It is 4 years old. Value = Resale.

            // Wait, cyclePos goes from 0 to cycle-1.
            // Example 4yr cycle.
            // Year 1: pos 0. Age 0.
            // Year 2: pos 1. Age 1.
            // ...
            // Year 4: pos 3. Age 3.
            // End of Year 4: Age 4. This is when we sell.

            // Terminal value is usually calculated AT THE END of the year.
            // So at end of Year 1, age is 1.
            // Age at end of year = cyclePos + 1.
            const ageAtEnd = cyclePos + 1;

            // Fraction of value lost = ageAtEnd / replaceCycle
            // If ageAtEnd = replaceCycle (4), we are at Resale Value.

            residualValue = currentBaseVal - (currentBaseVal - endValue) * (ageAtEnd / config.replaceCycle);

        } else {
            // Keep forever: Value is minimal. Maybe 5%? 
            // For now, 0 as per previous spec, unless we want to be fancy.
            residualValue = 0;
        }

        // Credit the residual value
        const lastIdx = params.years - 1;
        if (cashData[lastIdx]) cashData[lastIdx].cumulative -= Math.round(residualValue);
        if (financeData[lastIdx]) financeData[lastIdx].cumulative -= Math.round(residualValue);
    }

    return { cash: cashData, finance: financeData };
}
