import React from 'react';

const StatsPanel = ({ totalPlants, totalSites, isOpen, accentColor, regionName, onOpenReport }) => {
    if (!isOpen) return null;

    const cardStyle = accentColor ? {
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
        boxShadow: `0 8px 16px ${accentColor}33`
    } : {};

    return (
        <div className="filter-section stats-panel">
            <div className="region-header-row">
                <div className="region-context-badge">
                    {regionName || 'Rajasthan'}
                </div>
                {regionName && regionName !== 'Rajasthan' && (
                    <button className="report-mini-btn" onClick={onOpenReport} title="View Detailed Report">
                        Report
                    </button>
                )}
            </div>
            <div className="stats-card" style={cardStyle}>
                <span className="stats-label">Total Plants</span>
                <span className="stats-value">{totalPlants.toLocaleString()}</span>
            </div>
            <div className="stats-row">
                <div className="stats-mini-card">
                    <span className="mini-label">Total Sites</span>
                    <span className="mini-value">{totalSites.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default StatsPanel;
