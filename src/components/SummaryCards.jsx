import React from 'react';
import { SCENARIOS } from '../engine/constants';
import { Award } from 'lucide-react';

const SummaryCards = ({ results, params, paymentMode, hiddenLines, toggleLine }) => {
    // Compute totals
    const timeHorizon = params.years;

    const summaries = SCENARIOS.map(scenario => {
        const data = results[scenario.key][paymentMode];
        const finalYearData = data[data.length - 1]; // Last year
        const totalCost = finalYearData ? finalYearData.cumulative : 0;

        return {
            ...scenario,
            totalCost,
            avgAnnual: totalCost / timeHorizon
        };
    });

    const sortedSummaries = [...summaries].sort((a, b) => a.totalCost - b.totalCost);
    const minCost = sortedSummaries[0].totalCost;

    return (
        <div className="summary-grid">
            {sortedSummaries.map((item, index) => {
                const isCheapest = index === 0;
                const diff = item.totalCost - minCost;
                const isHidden = hiddenLines[item.key];

                return (
                    <div
                        key={item.key}
                        onClick={() => toggleLine(item.key)}
                        className={`summary-card ${isHidden ? 'hidden' : ''}`}
                        style={{
                            borderTopColor: isHidden ? 'var(--border-active)' : item.color
                        }}
                    >
                        {isCheapest && (
                            <div className="rank-badge">
                                <Award size={12} /> #1
                            </div>
                        )}

                        <h3 className="card-label">
                            {item.label}
                        </h3>

                        <div className="card-total">
                            ${item.totalCost.toLocaleString()}
                        </div>

                        <div className={`card-diff ${isCheapest ? 'diff-lowest' : 'diff-positive'}`}>
                            {isCheapest ? 'Lowest Cost' : `+$${diff.toLocaleString()}`}
                        </div>

                        <div className="card-avg">
                            Avg: ${Math.round(item.avgAnnual).toLocaleString()}/yr
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;
