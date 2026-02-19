import React from 'react';

const TabButton = ({ active, children, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`tab-button ${active ? 'active' : ''}`}
        >
            {children}
        </button>
    );
};
export default TabButton;
