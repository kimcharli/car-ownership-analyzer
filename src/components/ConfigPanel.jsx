import React from 'react';

const ConfigPanel = ({ params, setParams }) => {
    const handleExport = () => {
        try {
            const dataStr = JSON.stringify(params, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `car-cost-config-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export configuration.");
        }
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedParams = JSON.parse(e.target.result);
                // Basic validation: check if it has a few key properties
                if (typeof importedParams.newCarPrice === 'number' && typeof importedParams.years === 'number') {
                    setParams(prev => ({ ...prev, ...importedParams }));
                } else {
                    alert("Invalid configuration file: missing key parameters.");
                }
            } catch (err) {
                console.error("Failed to parse config", err);
                alert("Failed to parse configuration file.");
            }
        };
        reader.readAsText(file);
        // Reset input value so same file can be selected again
        event.target.value = '';
    };

    return (
        <div className="config-actions">
            <button
                onClick={handleExport}
                className="btn-secondary"
            >
                Export
            </button>
            <label className="btn-secondary">
                Import
                <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    style={{ display: 'none' }}
                />
            </label>
        </div>
    );
};

export default ConfigPanel;
