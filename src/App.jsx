import React, { useState, useMemo, useEffect } from 'react';
import { DEFAULT_PARAMS, SCENARIO_CONFIGS, SCENARIOS } from './engine/constants';
import init, { compute_scenario_wasm } from '../pkg/wasm_engine.js';
import ParameterPanel from './components/ParameterPanel';
import SummaryCards from './components/SummaryCards';
import CostChart from './components/CostChart';
import TabButton from './components/TabButton';
import ConfigPanel from './components/ConfigPanel';

function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'finance'
  const [chartType, setChartType] = useState('cumulative'); // 'cumulative' | 'annual'
  const [hiddenLines, setHiddenLines] = useState({});
  const [isWasmReady, setIsWasmReady] = useState(false);

  // Initialize WASM
  useEffect(() => {
    init().then(() => setIsWasmReady(true)).catch(console.error);
  }, []);

  // Memoize results calculation
  const results = useMemo(() => {
    if (!isWasmReady) return null;
    try {
      const data = {};
      Object.keys(SCENARIO_CONFIGS).forEach(key => {
        data[key] = compute_scenario_wasm(params, key);
      });
      return data;
    } catch (e) {
      console.error("Calculation error:", e);
      return null;
    }
  }, [params, isWasmReady]);

  const toggleLine = (key) => {
    setHiddenLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!results) return <div className="p-8 text-center text-blue-500">Initializing Calculation Engine...</div>;

  return (
    <div className="container">

      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">
          Car Lifetime Cost Comparator
        </h1>
        <p className="app-subtitle">
          Compare the true financial impact of different car buying strategies over {params.years} years.
        </p>
      </header>

      {/* Summary Cards */}
      <SummaryCards
        results={results}
        params={params}
        paymentMode={paymentMode}
        hiddenLines={hiddenLines}
        toggleLine={toggleLine}
      />

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h2 className="chart-title">Cost Projection</h2>

          <div className="chart-controls">
            <div className="control-group">
              <button
                onClick={() => setPaymentMode('cash')}
                className={`control-btn ${paymentMode === 'cash' ? 'active-blue' : ''}`}
              >
                Cash
              </button>
              <button
                onClick={() => setPaymentMode('finance')}
                className={`control-btn ${paymentMode === 'finance' ? 'active-blue' : ''}`}
              >
                Financed
              </button>
            </div>

            <div className="control-group">
              <button
                onClick={() => setChartType('cumulative')}
                className={`control-btn ${chartType === 'cumulative' ? 'active-purple' : ''}`}
              >
                Cumulative
              </button>
              <button
                onClick={() => setChartType('annual')}
                className={`control-btn ${chartType === 'annual' ? 'active-purple' : ''}`}
              >
                Annual
              </button>
            </div>
          </div>
        </div>

        <CostChart
          results={results}
          paymentMode={paymentMode}
          chartType={chartType}
          hiddenLines={hiddenLines}
        />
      </div>

      {/* Parameters */}
      <div className="mb-8">
        <div className="params-header">
          <div className="flex items-center gap-4">
            <h2 className="chart-title">Parameters</h2>
            <span className="params-hint hidden sm:inline">
              Adjust any value to recalculate instantly
            </span>
          </div>
          <ConfigPanel params={params} setParams={setParams} />
        </div>

        <ParameterPanel params={params} setParams={setParams} />
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Built with React & Recharts. No data is stored.</p>
      </footer>
    </div>
  );
}

export default App;
