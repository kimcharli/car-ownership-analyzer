import React from 'react';

const SliderInput = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
    format = "number", // number, currency, percent, years, age, boolean, multiplier
    description
}) => {

    const formatValue = (val) => {
        if (format === "currency") return `$${val.toLocaleString()}`;
        if (format === "percent") return `${val}%`;
        if (format === "years") return `${val} yr`;
        if (format === "age") return `Age ${val}`;
        if (format === "multiplier") return `${val}x`;
        if (format === "boolean") return val === 1 ? "Yes" : "No";
        return val;
    };

    const handleChange = (e) => {
        onChange(Number(e.target.value));
    };

    return (
        <div className="slider-container">
            <div className="slider-header">
                <label className="slider-label">{label}</label>
                <span className="slider-value">
                    {formatValue(value)}
                </span>
            </div>

            {description && (
                <p className="slider-desc">{description}</p>
            )}

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                className="slider-input"
            />
        </div>
    );
};

export default SliderInput;
