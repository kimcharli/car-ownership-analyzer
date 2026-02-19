use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct CostParams {
    pub newCarPrice: f64,
    pub cheapUsedPrice: f64,
    pub fourYrUsedPrice: f64,
    pub salesTax: f64,
    pub regFees: f64,
    pub newResalePercent: f64,
    pub newResale10Percent: f64,
    pub usedResalePercent: f64,

    pub insuranceNew: f64,
    pub insuranceCheapUsed: f64,
    pub insurance4yrUsed: f64,
    pub maintNewBase: f64,
    pub maintCheapUsedBase: f64,
    pub maint4yrUsedBase: f64,
    pub maintIncreaseRate: f64,
    pub fuelCostYear: f64,
    pub fuelPenaltyOld: f64,
    pub fuelPenaltyStart: f64, // Age
    pub fuelPenaltyRamp: f64,  // Years
    pub annualRegRate: f64,
    pub maintCapMult: f64,
    pub insAgeFactor1: f64,
    pub insAgeFactor2: f64,
    pub insAgeFactor3: f64,

    pub downPaymentPct: f64,
    pub loanTermYears: f64,
    pub interestRate: f64,
    pub usedLoanTerm: f64,
    pub usedInterestRate: f64,
    pub inflation: f64,
    pub discountRate: f64,
    pub includeTerminalValue: u32,
    pub years: u32,
}

#[derive(Debug, Serialize, Clone)]
pub struct YearData {
    pub year: u32,
    pub annual: f64,
    pub cumulative: f64,
    pub insurance: f64,
    pub maintenance: f64,
    pub fuel: f64,
    pub purchase: f64,
}

#[derive(Debug, Serialize, Clone)]
pub struct ScenarioResult {
    pub cash: Vec<YearData>,
    pub finance: Vec<YearData>,
}

struct ScenarioConfig {
    base_purchase: String,
    replace_cycle: u32, // Use a large number for Infinity
    resale_key: Option<String>,
    insurance_key: String,
    maint_key: String,
    loan_term_key: String,
    interest_rate_key: String,
    start_age: u32,
    fuel_multiplier_mode: String, // "normal", "cheapUsed", "fourYrUsed"
}

impl ScenarioConfig {
    fn new(key: &str) -> Option<Self> {
        match key {
            "new4yr" => Some(Self {
                base_purchase: "newCarPrice".to_string(),
                replace_cycle: 4,
                resale_key: Some("newResalePercent".to_string()),
                insurance_key: "insuranceNew".to_string(),
                maint_key: "maintNewBase".to_string(),
                loan_term_key: "loanTermYears".to_string(),
                interest_rate_key: "interestRate".to_string(),
                start_age: 0,
                fuel_multiplier_mode: "normal".to_string(),
            }),
            "new10yr" => Some(Self {
                base_purchase: "newCarPrice".to_string(),
                replace_cycle: 10,
                resale_key: Some("newResale10Percent".to_string()),
                insurance_key: "insuranceNew".to_string(),
                maint_key: "maintNewBase".to_string(),
                loan_term_key: "loanTermYears".to_string(),
                interest_rate_key: "interestRate".to_string(),
                start_age: 0,
                fuel_multiplier_mode: "normal".to_string(),
            }),
            "newForever" => Some(Self {
                base_purchase: "newCarPrice".to_string(),
                replace_cycle: 1000, // Effectively infinity for our timeline
                resale_key: None,
                insurance_key: "insuranceNew".to_string(),
                maint_key: "maintNewBase".to_string(),
                loan_term_key: "loanTermYears".to_string(),
                interest_rate_key: "interestRate".to_string(),
                start_age: 0,
                fuel_multiplier_mode: "normal".to_string(),
            }),
            "cheapUsed" => Some(Self {
                base_purchase: "cheapUsedPrice".to_string(),
                replace_cycle: 10,
                resale_key: Some("usedResalePercent".to_string()),
                insurance_key: "insuranceCheapUsed".to_string(),
                maint_key: "maintCheapUsedBase".to_string(),
                loan_term_key: "usedLoanTerm".to_string(),
                interest_rate_key: "usedInterestRate".to_string(),
                start_age: 8,
                fuel_multiplier_mode: "cheapUsed".to_string(),
            }),
            "fourYrUsed" => Some(Self {
                base_purchase: "fourYrUsedPrice".to_string(),
                replace_cycle: 10,
                resale_key: Some("usedResalePercent".to_string()),
                insurance_key: "insurance4yrUsed".to_string(),
                maint_key: "maint4yrUsedBase".to_string(),
                loan_term_key: "usedLoanTerm".to_string(),
                interest_rate_key: "usedInterestRate".to_string(),
                start_age: 4,
                fuel_multiplier_mode: "fourYrUsed".to_string(),
            }),
            _ => None,
        }
    }
}

// Helper to get field by name (reflection-like)
fn get_param(params: &CostParams, key: &str) -> f64 {
    match key {
        "newCarPrice" => params.newCarPrice,
        "cheapUsedPrice" => params.cheapUsedPrice,
        "fourYrUsedPrice" => params.fourYrUsedPrice,
        "salesTax" => params.salesTax,
        "regFees" => params.regFees,
        "newResalePercent" => params.newResalePercent,
        "newResale10Percent" => params.newResale10Percent,
        "usedResalePercent" => params.usedResalePercent,
        "insuranceNew" => params.insuranceNew,
        "insuranceCheapUsed" => params.insuranceCheapUsed,
        "insurance4yrUsed" => params.insurance4yrUsed,
        "maintNewBase" => params.maintNewBase,
        "maintCheapUsedBase" => params.maintCheapUsedBase,
        "maint4yrUsedBase" => params.maint4yrUsedBase,
        "loanTermYears" => params.loanTermYears,
        "interestRate" => params.interestRate,
        "usedLoanTerm" => params.usedLoanTerm,
        "usedInterestRate" => params.usedInterestRate,
        "maintIncreaseRate" => params.maintIncreaseRate,
        "maintCapMult" => params.maintCapMult,
        "fuelCostYear" => params.fuelCostYear,
        "fuelPenaltyOld" => params.fuelPenaltyOld,
        "fuelPenaltyStart" => params.fuelPenaltyStart,
        "fuelPenaltyRamp" => params.fuelPenaltyRamp,
        "annualRegRate" => params.annualRegRate,
        "insAgeFactor3" => params.insAgeFactor3,
        "insAgeFactor2" => params.insAgeFactor2,
        "insAgeFactor1" => params.insAgeFactor1,
        "downPaymentPct" => params.downPaymentPct,
        "inflation" => params.inflation,
        _ => 0.0,
    }
}

pub fn compute_scenario(params: &CostParams, scenario_key: &str) -> Result<ScenarioResult, String> {
    let config = ScenarioConfig::new(scenario_key)
        .ok_or_else(|| format!("Unknown scenario: {}", scenario_key))?;

    let mut cash_data = Vec::new();
    let mut finance_data = Vec::new();

    let mut cash_cumulative = 0.0;
    let mut finance_cumulative = 0.0;

    let mut loan_balance = 0.0;
    let mut current_annual_payment = 0.0;
    
    // We don't need 'p' helper callback, we have get_param function
    
    for yr in 1..=params.years {
        let infl_mult = (1.0 + params.inflation / 100.0).powi(yr as i32 - 1);

        // --- 1. Vehicle Age ---
        let car_age = if config.replace_cycle >= 1000 {
            yr - 1
        } else {
            (yr - 1) % config.replace_cycle
        };
        let vehicle_age = config.start_age + car_age;

        // --- 2. Replacement Detection ---
        let is_replacement_year = yr == 1 || (config.replace_cycle < 1000 && car_age == 0);

        // --- 3. Purchase & Finance Logic ---
        let mut cash_purchase_cost = 0.0;
        let mut finance_direct_cost = 0.0;

        if is_replacement_year {
            let base_price = get_param(params, &config.base_purchase);
            let purchase_price = base_price * infl_mult;
            let total_purchase = purchase_price * (1.0 + params.salesTax / 100.0) + params.regFees * infl_mult;

            // Resale Income
            let mut resale_income = 0.0;
            if yr > 1 {
                let prev_purchase_year = yr - config.replace_cycle;
                let prev_infl_mult = (1.0 + params.inflation / 100.0).powi(prev_purchase_year as i32 - 1);
                
                if let Some(resale_key) = &config.resale_key {
                    let resale_pct = get_param(params, resale_key);
                    resale_income = get_param(params, &config.base_purchase) * prev_infl_mult * (resale_pct / 100.0);
                }
            }

            // Cash Mode
            cash_purchase_cost = total_purchase - resale_income;

            // Finance Mode
            let net_equity = resale_income - loan_balance;
            
            // Reset loan
            loan_balance = 0.0;
            current_annual_payment = 0.0;

            if params.downPaymentPct >= 100.0 {
                finance_direct_cost = total_purchase - net_equity;
                loan_balance = 0.0;
            } else {
                let down_payment_amount = total_purchase * (params.downPaymentPct / 100.0);
                finance_direct_cost = down_payment_amount - net_equity;

                let amount_to_finance = total_purchase - down_payment_amount;

                let rate_key = &config.interest_rate_key;
                let term_key = &config.loan_term_key;
                let rate_val = get_param(params, rate_key);
                let term_val = get_param(params, term_key);

                let monthly_rate = (rate_val / 100.0) / 12.0;
                let num_payments = term_val * 12.0;

                if monthly_rate > 0.0 {
                    let monthly_payment = amount_to_finance * monthly_rate * (1.0 + monthly_rate).powf(num_payments) 
                        / ((1.0 + monthly_rate).powf(num_payments) - 1.0);
                    current_annual_payment = monthly_payment * 12.0;
                } else {
                    current_annual_payment = amount_to_finance / term_val;
                }

                loan_balance = amount_to_finance;
            }
        }

        // --- 4. Loan Payments ---
        let mut finance_loan_payment = 0.0;
        if loan_balance > 0.0 {
            let rate_key = &config.interest_rate_key;
            let annual_interest = loan_balance * (get_param(params, rate_key) / 100.0);
            
            let payment = current_annual_payment.min(loan_balance + annual_interest);
            
            let principal = payment - annual_interest;
            loan_balance = (loan_balance - principal).max(0.0);
            
            finance_loan_payment = payment;
        }

        // --- 5. Operating Costs ---
        
        // Insurance
        let mut ins_factor = 1.0;
        if vehicle_age >= 16 { ins_factor = params.insAgeFactor3 / 100.0; }
        else if vehicle_age >= 11 { ins_factor = params.insAgeFactor2 / 100.0; }
        else if vehicle_age >= 6 { ins_factor = params.insAgeFactor1 / 100.0; }
        
        let insurance = get_param(params, &config.insurance_key) * infl_mult * ins_factor;

        // Maintenance
        let raw_maint_mult = (1.0 + params.maintIncreaseRate / 100.0).powf(vehicle_age as f64);
        let maint_mult = raw_maint_mult.min(params.maintCapMult);
        let maintenance = get_param(params, &config.maint_key) * infl_mult * maint_mult;

        // Fuel
        let mut fuel_penalty = 1.0;
        if config.fuel_multiplier_mode == "cheapUsed" || config.fuel_multiplier_mode == "fourYrUsed" {
            let penalty_base = params.fuelPenaltyOld / 100.0;
            let factor = if config.fuel_multiplier_mode == "cheapUsed" { 1.0 } else { 0.5 };
            fuel_penalty = 1.0 + penalty_base * factor;
        } else {
            let start_age = params.fuelPenaltyStart;
            let ramp_years = params.fuelPenaltyRamp;
            let years_over = vehicle_age as f64 - start_age;
            if years_over > 0.0 {
                let penalty_max = params.fuelPenaltyOld / 100.0;
                let ramp_factor = (years_over / ramp_years).min(1.0);
                fuel_penalty = 1.0 + penalty_max * ramp_factor;
            }
        }
        let fuel = params.fuelCostYear * infl_mult * fuel_penalty;

        // Registration
        let annual_reg = (params.regFees * (params.annualRegRate / 100.0)) * infl_mult;

        // Totals
        let operating_total = insurance + maintenance + fuel + annual_reg;

        let cash_annual = cash_purchase_cost + operating_total;
        let finance_annual = finance_direct_cost + finance_loan_payment + operating_total;

        cash_cumulative += cash_annual;
        finance_cumulative += finance_annual;

        cash_data.push(YearData {
            year: yr,
            annual: cash_annual.round(),
            cumulative: cash_cumulative.round(),
            insurance: insurance.round(),
            maintenance: maintenance.round(),
            fuel: fuel.round(),
            purchase: cash_purchase_cost.round(),
        });

        finance_data.push(YearData {
            year: yr,
            annual: finance_annual.round(),
            cumulative: finance_cumulative.round(),
            insurance: insurance.round(),
            maintenance: maintenance.round(),
            fuel: fuel.round(),
            purchase: (finance_direct_cost + finance_loan_payment).round(),
        });
    }

    // --- Terminal Value Adjustment ---
    if params.includeTerminalValue == 1 {
        let final_yr = params.years;
        let infl_mult_final = (1.0 + params.inflation / 100.0).powi(final_yr as i32 - 1);
        
        let mut residual_value = 0.0;

        if config.replace_cycle < 1000 {
            let current_base_val = get_param(params, &config.base_purchase) * infl_mult_final;
            
            let resale_pct = if let Some(key) = &config.resale_key {
                get_param(params, key) / 100.0
            } else {
                0.0
            };
            
            let end_value = current_base_val * resale_pct;
            let cycle_pos = (final_yr - 1) % config.replace_cycle;
            let age_at_end = cycle_pos + 1;
            
            residual_value = current_base_val - (current_base_val - end_value) * (age_at_end as f64 / config.replace_cycle as f64);
        }

        let last_idx = (final_yr - 1) as usize;
        if last_idx < cash_data.len() {
            cash_data[last_idx].cumulative -= residual_value.round();
            finance_data[last_idx].cumulative -= residual_value.round();
        }
    }

    Ok(ScenarioResult {
        cash: cash_data,
        finance: finance_data,
    })
}
