import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SCENARIOS } from '../engine/constants';

const CostChart = ({ results, paymentMode, chartType, hiddenLines }) => {
    const chartData = useMemo(() => {
        const years = results.new4yr.cash.length; // Assuming valid data
        const data = [];

        for (let i = 0; i < years; i++) {
            const row = { year: i + 1 };
            SCENARIOS.forEach(scenario => {
                const scenarioData = results[scenario.key][paymentMode][i];
                row[scenario.key] = chartType === 'annual' ? scenarioData.annual : scenarioData.cumulative;
            });
            data.push(row);
        }
        return data;
    }, [results, paymentMode, chartType]);

    const formatCurrency = (val) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
        return `$${val}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Sort payload by value ascending (cheapest on top)
            const sortedPayload = [...payload].sort((a, b) => a.value - b.value);

            return (
                <div className="tooltip-custom">
                    <p className="tooltip-title">Year {label}</p>
                    {sortedPayload.map((entry) => (
                        <div key={entry.name} className="tooltip-item">
                            <span style={{ color: entry.color, marginRight: '8px' }}>{entry.name}:</span>
                            <span className="font-mono">
                                ${entry.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container-inner">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
                    <XAxis
                        dataKey="year"
                        stroke="#64748b"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#64748b"
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#94a3b8' }} />

                    {SCENARIOS.map((scenario) => (
                        <Line
                            key={scenario.key}
                            type="monotone"
                            dataKey={scenario.key}
                            name={scenario.label}
                            stroke={scenario.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                            hide={hiddenLines[scenario.key]}
                            strokeDasharray={scenario.key === 'newForever' ? '5 5' : ''}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CostChart;
