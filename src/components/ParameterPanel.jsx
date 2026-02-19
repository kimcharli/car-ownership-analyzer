import React, { useState } from 'react';
import { PARAM_CONFIGS } from '../engine/constants';
import SliderInput from './SliderInput';
import TabButton from './TabButton';

const ParameterPanel = ({ params, setParams }) => {
    const [activeTab, setActiveTab] = useState('purchase');

    const TABS = [
        { id: 'purchase', label: 'Purchase & Resale' },
        { id: 'operating', label: 'Operating Costs' },
        { id: 'finance', label: 'Finance & Economy' },
    ];

    return (
        <div className="parameter-panel">
            <div className="tabs-container">
                {TABS.map(tab => (
                    <TabButton
                        key={tab.id}
                        active={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </TabButton>
                ))}
            </div>

            <div className="panel-grid">
                {PARAM_CONFIGS
                    .filter(config => config.tab === activeTab)
                    .map(config => (
                        <SliderInput
                            key={config.key}
                            {...config}
                            value={params[config.key]}
                            onChange={(val) => setParams(prev => ({ ...prev, [config.key]: val }))}
                        />
                    ))}
            </div>
        </div>
    );
};
export default ParameterPanel;
