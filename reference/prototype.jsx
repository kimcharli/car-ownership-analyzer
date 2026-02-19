/**
 * Reference Implementation — Working Prototype
 * 
 * This is the interactive React component developed during the design conversation.
 * It serves as a reference for the spec-driven rebuild. This is a single-file
 * implementation that runs as a Claude artifact (React JSX with inline styles).
 * 
 * The production build should decompose this into the module structure
 * described in specs/TECHNICAL.md.
 * 
 * Dependencies: react, recharts
 */

import { useState, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = {
  bg: "#0f1117",
  card: "#1a1d27",
  cardBorder: "#2a2d3a",
  accent1: "#f59e0b",
  accent2: "#06b6d4",
  accent3: "#a78bfa",
  accent4: "#f472b6",
  accent5: "#4ade80",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  gridLine: "#1e2130",
  tooltipBg: "#1e2130",
  success: "#22c55e",
};

const fmt = (v) => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v.toFixed(0)}`;
};

const fmtFull = (v) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const SliderInput = ({ label, value, onChange, min, max, step, format, suffix, description }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
      <label style={{ fontSize: 13, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{label}</label>
      <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, fontFamily: "'JetBrains Mono', monospace" }}>
        {format ? format(value) : value}{suffix || ""}
      </span>
    </div>
    {description && <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 4 }}>{description}</div>}
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ width: "100%", accentColor: COLORS.accent1, cursor: "pointer", height: 6 }}
    />
  </div>
);

const TabButton = ({ active, children, onClick, color }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 18px", border: "1px solid", borderRadius: 8, cursor: "pointer",
      fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.2s",
      background: active ? (color || COLORS.accent1) + "18" : "transparent",
      borderColor: active ? (color || COLORS.accent1) : COLORS.cardBorder,
      color: active ? (color || COLORS.accent1) : COLORS.textMuted,
    }}
  >{children}</button>
);

function computeScenario(params, scenarioType) {
  const { newCarPrice, cheapUsedPrice, fourYrUsedPrice, salesTax, regFees,
    newResalePercent, newResale10Percent, usedResalePercent,
    insuranceNew, insuranceCheapUsed, insurance4yrUsed,
    maintNewBase, maintCheapUsedBase, maint4yrUsedBase, maintIncreaseRate,
    fuelCostYear, fuelPenaltyOld,
    inflation, discountRate,
    downPaymentPct, loanTermYears, interestRate,
    years } = params;

  let config;
  if (scenarioType === "new4yr") {
    config = { basePurchase: newCarPrice, replaceCycle: 4, resalePct: newResalePercent / 100,
      insuranceBase: insuranceNew, maintBase: maintNewBase, startAge: 0, fuelMult: 1.0 };
  } else if (scenarioType === "new10yr") {
    config = { basePurchase: newCarPrice, replaceCycle: 10, resalePct: newResale10Percent / 100,
      insuranceBase: insuranceNew, maintBase: maintNewBase, startAge: 0, fuelMult: 1.0 };
  } else if (scenarioType === "newForever") {
    config = { basePurchase: newCarPrice, replaceCycle: Infinity, resalePct: 0,
      insuranceBase: insuranceNew, maintBase: maintNewBase, startAge: 0, fuelMult: 1.0 };
  } else if (scenarioType === "cheapUsed") {
    config = { basePurchase: cheapUsedPrice, replaceCycle: 10, resalePct: usedResalePercent / 100,
      insuranceBase: insuranceCheapUsed, maintBase: maintCheapUsedBase, startAge: 8, fuelMult: 1 + fuelPenaltyOld / 100 };
  } else {
    config = { basePurchase: fourYrUsedPrice, replaceCycle: 10, resalePct: usedResalePercent / 100,
      insuranceBase: insurance4yrUsed, maintBase: maint4yrUsedBase, startAge: 4, fuelMult: 1 + (fuelPenaltyOld / 200) };
  }

  const cashData = [];
  const financeData = [];
  let cashCumulative = 0;
  let financeCumulative = 0;
  let loanBalance = 0;
  let annualPayment = 0;

  for (let yr = 1; yr <= years; yr++) {
    const inflMult = Math.pow(1 + inflation / 100, yr - 1);
    const isFiniteCycle = config.replaceCycle !== Infinity;
    const carAge = isFiniteCycle ? ((yr - 1) % config.replaceCycle) : (yr - 1);
    const vehicleAge = config.startAge + carAge;
    const isReplacementYear = yr === 1 || (isFiniteCycle && carAge === 0);

    let yearCostCash = 0;
    let yearCostFinance = 0;
    const purchasePrice = config.basePurchase * inflMult;

    if (isReplacementYear) {
      const totalPurchase = purchasePrice * (1 + salesTax / 100) + regFees * inflMult;
      let resaleIncome = 0;
      if (yr > 1 && isFiniteCycle) {
        const prevInflMult = Math.pow(1 + inflation / 100, yr - 1 - config.replaceCycle);
        resaleIncome = config.basePurchase * Math.max(prevInflMult, 0) * config.resalePct;
      }
      yearCostCash += totalPurchase - resaleIncome;

      const downPay = totalPurchase * (downPaymentPct / 100);
      const loanAmt = totalPurchase - downPay;
      loanBalance = loanAmt;
      const monthlyRate = (interestRate / 100) / 12;
      const numPayments = loanTermYears * 12;
      if (monthlyRate > 0 && numPayments > 0) {
        const monthlyPay = loanAmt * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        annualPayment = monthlyPay * 12;
      } else {
        annualPayment = numPayments > 0 ? loanAmt / loanTermYears : loanAmt;
      }
      yearCostFinance += downPay - resaleIncome;
    }

    if (loanBalance > 0) {
      const interestPortion = loanBalance * (interestRate / 100);
      const payment = Math.min(annualPayment, loanBalance + interestPortion);
      yearCostFinance += payment;
      const principalPortion = payment - interestPortion;
      loanBalance = Math.max(0, loanBalance - principalPortion);
    }

    const ageFactor = vehicleAge > 15 ? 0.6 : vehicleAge > 10 ? 0.7 : vehicleAge > 5 ? 0.85 : 1.0;
    const insurance = config.insuranceBase * inflMult * ageFactor;

    const maintAgeMult = Math.min(Math.pow(1 + maintIncreaseRate / 100, vehicleAge), 8);
    const maintenance = config.maintBase * inflMult * maintAgeMult;

    let fuelAgePenalty = config.fuelMult;
    if ((scenarioType === "newForever" || scenarioType === "new10yr") && vehicleAge > 10) {
      fuelAgePenalty = 1 + (fuelPenaltyOld / 100) * Math.min((vehicleAge - 10) / 10, 1);
    }
    const fuel = fuelCostYear * inflMult * fuelAgePenalty;

    const annualReg = (regFees * 0.3) * inflMult;
    const operatingCosts = insurance + maintenance + fuel + annualReg;

    yearCostCash += operatingCosts;
    yearCostFinance += operatingCosts;

    cashCumulative += yearCostCash;
    financeCumulative += yearCostFinance;

    cashData.push({
      year: yr, annual: Math.round(yearCostCash), cumulative: Math.round(cashCumulative),
      insurance: Math.round(insurance), maintenance: Math.round(maintenance),
      fuel: Math.round(fuel), purchase: isReplacementYear ? Math.round(yearCostCash - operatingCosts) : 0,
    });

    financeData.push({
      year: yr, annual: Math.round(yearCostFinance), cumulative: Math.round(financeCumulative),
      insurance: Math.round(insurance), maintenance: Math.round(maintenance),
      fuel: Math.round(fuel),
    });
  }

  return { cash: cashData, finance: financeData };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: COLORS.tooltipBg, border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: 8, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    }}>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Year {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 20, fontSize: 13, marginBottom: 2 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmtFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const SCENARIOS = [
  { key: "new4yr", label: "New Every 4yr", color: COLORS.accent1 },
  { key: "new10yr", label: "New Every 10yr", color: COLORS.accent5 },
  { key: "newForever", label: "New — Keep Forever", color: COLORS.accent4 },
  { key: "cheapUsed", label: "Cheap Used / 10yr", color: COLORS.accent2 },
  { key: "fourYrUsed", label: "4yr Used / 10yr", color: COLORS.accent3 },
];

const CHART_KEYS = [
  { dataKey: "New Every 4yr", color: COLORS.accent1, dash: undefined },
  { dataKey: "New Every 10yr", color: COLORS.accent5, dash: undefined },
  { dataKey: "New — Keep Forever", color: COLORS.accent4, dash: "8 4" },
  { dataKey: "Cheap Used / 10yr", color: COLORS.accent2, dash: undefined },
  { dataKey: "4yr Used / 10yr", color: COLORS.accent3, dash: undefined },
];

export default function CarCostCompare() {
  const [params, setParams] = useState({
    newCarPrice: 38000, cheapUsedPrice: 8000, fourYrUsedPrice: 22000,
    salesTax: 7, regFees: 500,
    newResalePercent: 45, newResale10Percent: 20, usedResalePercent: 15,
    insuranceNew: 2000, insuranceCheapUsed: 900, insurance4yrUsed: 1400,
    maintNewBase: 400, maintCheapUsedBase: 1200, maint4yrUsedBase: 800,
    maintIncreaseRate: 8,
    fuelCostYear: 2000, fuelPenaltyOld: 15,
    inflation: 3, discountRate: 5,
    downPaymentPct: 20, loanTermYears: 5, interestRate: 6.5,
    years: 40,
  });

  const [paymentMode, setPaymentMode] = useState("cash");
  const [chartType, setChartType] = useState("cumulative");
  const [showPanel, setShowPanel] = useState("purchase");
  const [hiddenLines, setHiddenLines] = useState({});

  const set = useCallback((key) => (val) => setParams((p) => ({ ...p, [key]: val })), []);
  const toggleLine = (key) => setHiddenLines(h => ({ ...h, [key]: !h[key] }));

  const results = useMemo(() => ({
    new4yr: computeScenario(params, "new4yr"),
    new10yr: computeScenario(params, "new10yr"),
    newForever: computeScenario(params, "newForever"),
    cheapUsed: computeScenario(params, "cheapUsed"),
    fourYrUsed: computeScenario(params, "fourYrUsed"),
  }), [params]);

  const chartData = useMemo(() => {
    const mode = paymentMode;
    const key = chartType === "cumulative" ? "cumulative" : "annual";
    return Array.from({ length: params.years }, (_, i) => ({
      year: i + 1,
      "New Every 4yr": results.new4yr[mode][i]?.[key] || 0,
      "New Every 10yr": results.new10yr[mode][i]?.[key] || 0,
      "New — Keep Forever": results.newForever[mode][i]?.[key] || 0,
      "Cheap Used / 10yr": results.cheapUsed[mode][i]?.[key] || 0,
      "4yr Used / 10yr": results.fourYrUsed[mode][i]?.[key] || 0,
    }));
  }, [results, paymentMode, chartType, params.years]);

  const totals = {};
  SCENARIOS.forEach(s => {
    totals[s.key] = results[s.key][paymentMode][params.years - 1]?.cumulative || 0;
  });
  const minTotal = Math.min(...Object.values(totals));
  const ranked = [...SCENARIOS].sort((a, b) => totals[a.key] - totals[b.key]);

  const panels = {
    purchase: (
      <>
        <SliderInput label="New Car Price" value={params.newCarPrice} onChange={set("newCarPrice")} min={20000} max={80000} step={1000} format={fmtFull} description="Base MSRP in today's dollars" />
        <SliderInput label="Cheap Used Car Price" value={params.cheapUsedPrice} onChange={set("cheapUsedPrice")} min={3000} max={20000} step={500} format={fmtFull} description="~8-10 year old vehicle" />
        <SliderInput label="4-Year Used Car Price" value={params.fourYrUsedPrice} onChange={set("fourYrUsedPrice")} min={10000} max={50000} step={1000} format={fmtFull} />
        <SliderInput label="Sales Tax" value={params.salesTax} onChange={set("salesTax")} min={0} max={12} step={0.5} suffix="%" />
        <SliderInput label="Registration / Fees" value={params.regFees} onChange={set("regFees")} min={100} max={2000} step={50} format={fmtFull} />
        <SliderInput label="New Car Resale @ 4yr" value={params.newResalePercent} onChange={set("newResalePercent")} min={10} max={70} step={5} suffix="%" description="% of purchase price when trading in at 4 years" />
        <SliderInput label="New Car Resale @ 10yr" value={params.newResale10Percent} onChange={set("newResale10Percent")} min={5} max={40} step={5} suffix="%" description="% of purchase price when trading in at 10 years" />
        <SliderInput label="Used Car Resale @ 10yr" value={params.usedResalePercent} onChange={set("usedResalePercent")} min={0} max={40} step={5} suffix="%" />
      </>
    ),
    operating: (
      <>
        <SliderInput label="Insurance — New Car" value={params.insuranceNew} onChange={set("insuranceNew")} min={800} max={5000} step={100} format={fmtFull} suffix="/yr" />
        <SliderInput label="Insurance — Cheap Used" value={params.insuranceCheapUsed} onChange={set("insuranceCheapUsed")} min={400} max={3000} step={100} format={fmtFull} suffix="/yr" />
        <SliderInput label="Insurance — 4yr Used" value={params.insurance4yrUsed} onChange={set("insurance4yrUsed")} min={600} max={4000} step={100} format={fmtFull} suffix="/yr" />
        <SliderInput label="Maintenance — New (base)" value={params.maintNewBase} onChange={set("maintNewBase")} min={100} max={2000} step={50} format={fmtFull} suffix="/yr" />
        <SliderInput label="Maintenance — Cheap Used (base)" value={params.maintCheapUsedBase} onChange={set("maintCheapUsedBase")} min={300} max={4000} step={100} format={fmtFull} suffix="/yr" />
        <SliderInput label="Maintenance — 4yr Used (base)" value={params.maint4yrUsedBase} onChange={set("maint4yrUsedBase")} min={200} max={3000} step={100} format={fmtFull} suffix="/yr" />
        <SliderInput label="Maintenance Increase / Year of Age" value={params.maintIncreaseRate} onChange={set("maintIncreaseRate")} min={0} max={20} step={1} suffix="%" description="Compounds per year of vehicle age (capped at 8× base)" />
        <SliderInput label="Annual Fuel Cost" value={params.fuelCostYear} onChange={set("fuelCostYear")} min={500} max={5000} step={100} format={fmtFull} />
        <SliderInput label="Fuel Penalty (old vehicles)" value={params.fuelPenaltyOld} onChange={set("fuelPenaltyOld")} min={0} max={40} step={5} suffix="%" />
      </>
    ),
    finance: (
      <>
        <SliderInput label="Down Payment" value={params.downPaymentPct} onChange={set("downPaymentPct")} min={0} max={100} step={5} suffix="%" description="Set to 100% to simulate full cash purchase" />
        <SliderInput label="Loan Term" value={params.loanTermYears} onChange={set("loanTermYears")} min={2} max={7} step={1} suffix=" years" />
        <SliderInput label="Interest Rate (APR)" value={params.interestRate} onChange={set("interestRate")} min={0} max={15} step={0.5} suffix="%" />
        <SliderInput label="Inflation Rate" value={params.inflation} onChange={set("inflation")} min={0} max={8} step={0.5} suffix="%" />
        <SliderInput label="Discount Rate" value={params.discountRate} onChange={set("discountRate")} min={0} max={10} step={0.5} suffix="%" description="Opportunity cost of capital" />
        <SliderInput label="Time Horizon" value={params.years} onChange={set("years")} min={10} max={40} step={5} suffix=" years" />
      </>
    ),
  };

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: "24px 20px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>
            {params.years}-Year Car Ownership Cost
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: "6px 0 0" }}>
            5 strategies compared — click any card to show/hide its line
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {ranked.map(({ key, label, color }, idx) => {
            const isHidden = hiddenLines[key];
            return (
              <div key={key} onClick={() => toggleLine(key)} style={{
                flex: "1 1 0", minWidth: 170,
                background: isHidden ? COLORS.bg : COLORS.card,
                border: `1px solid ${isHidden ? COLORS.cardBorder : color + "44"}`,
                borderRadius: 12, padding: "12px 14px", borderTop: `3px solid ${isHidden ? COLORS.textDim : color}`,
                cursor: "pointer", transition: "all 0.2s", opacity: isHidden ? 0.5 : 1,
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: 8, right: 10, fontSize: 10, fontWeight: 700,
                  color: idx === 0 ? COLORS.success : COLORS.textDim,
                  background: idx === 0 ? COLORS.success + "18" : "transparent",
                  padding: idx === 0 ? "2px 6px" : 0, borderRadius: 4,
                }}>#{idx + 1}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 5, lineHeight: 1.3, paddingRight: 24 }}>{label}</div>
                <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: isHidden ? COLORS.textDim : color }}>
                  {fmtFull(totals[key])}
                </div>
                <div style={{ fontSize: 11, marginTop: 3, color: totals[key] === minTotal ? COLORS.success : COLORS.textDim }}>
                  {totals[key] === minTotal ? "✓ Lowest" : `+${fmtFull(totals[key] - minTotal)}`}
                </div>
                <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 1 }}>
                  {fmtFull(Math.round(totals[key] / params.years))}/yr avg
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, marginRight: 16 }}>
            <TabButton active={paymentMode === "cash"} onClick={() => setPaymentMode("cash")}>Cash</TabButton>
            <TabButton active={paymentMode === "finance"} onClick={() => setPaymentMode("finance")}>Financed</TabButton>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <TabButton active={chartType === "cumulative"} onClick={() => setChartType("cumulative")} color={COLORS.accent2}>Cumulative</TabButton>
            <TabButton active={chartType === "annual"} onClick={() => setChartType("annual")} color={COLORS.accent2}>Annual</TabButton>
          </div>
        </div>
        <div style={{
          background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 12, padding: "20px 16px 12px", marginBottom: 20,
        }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} />
              <XAxis dataKey="year" stroke={COLORS.textDim} tick={{ fontSize: 11, fontFamily: "'JetBrains Mono'" }}
                label={{ value: "Year", position: "insideBottomRight", offset: -5, fontSize: 11, fill: COLORS.textDim }} />
              <YAxis stroke={COLORS.textDim} tick={{ fontSize: 11, fontFamily: "'JetBrains Mono'" }}
                tickFormatter={fmt} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {CHART_KEYS.map(({ dataKey, color, dash }) => (
                <Line key={dataKey} type="monotone" dataKey={dataKey} stroke={color}
                  strokeWidth={2.5} dot={false} strokeDasharray={dash}
                  hide={hiddenLines[SCENARIOS.find(s => s.label === dataKey ||
                    (s.key === "new4yr" && dataKey === "New Every 4yr") ||
                    (s.key === "new10yr" && dataKey === "New Every 10yr") ||
                    (s.key === "newForever" && dataKey === "New — Keep Forever") ||
                    (s.key === "cheapUsed" && dataKey === "Cheap Used / 10yr") ||
                    (s.key === "fourYrUsed" && dataKey === "4yr Used / 10yr")
                  )?.key]}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 12, padding: "18px 20px",
        }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            <TabButton active={showPanel === "purchase"} onClick={() => setShowPanel("purchase")} color={COLORS.accent3}>Purchase & Resale</TabButton>
            <TabButton active={showPanel === "operating"} onClick={() => setShowPanel("operating")} color={COLORS.accent3}>Operating Costs</TabButton>
            <TabButton active={showPanel === "finance"} onClick={() => setShowPanel("finance")} color={COLORS.accent3}>Finance & Economy</TabButton>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            {panels[showPanel]}
          </div>
        </div>
        <div style={{
          background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 12, padding: "14px 18px", marginTop: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 6 }}>Scenario Details</div>
          <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 24px" }}>
              <div>• <b style={{ color: COLORS.accent1 }}>New / 4yr</b> — Buy new, sell at {params.newResalePercent}% after 4yr, repeat ({Math.floor(params.years / 4)} purchases)</div>
              <div>• <b style={{ color: COLORS.accent5 }}>New / 10yr</b> — Buy new, sell at {params.newResale10Percent}% after 10yr, repeat ({Math.floor(params.years / 10)} purchases)</div>
              <div>• <b style={{ color: COLORS.accent4 }}>New / Keep</b> — Buy one new car, maintain for all {params.years} years</div>
              <div>• <b style={{ color: COLORS.accent2 }}>Cheap Used</b> — Buy ~8yr old car, drive 10yr, repeat</div>
              <div>• <b style={{ color: COLORS.accent3 }}>4yr Used</b> — Buy 4yr old car, drive 10yr, repeat</div>
              <div>• All prices inflate at {params.inflation}%/yr · Maint compounds {params.maintIncreaseRate}%/yr of age (cap 8×)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
