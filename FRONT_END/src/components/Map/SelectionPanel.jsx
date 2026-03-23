import React from 'react';

const SelectionPanel = ({ info, setInfo, side, comparisonMode }) => {
    if (!info) return null;
    const isSideA = side === 'A';

    return (
        <div className={`selection-panel-card ${isSideA ? 'side-a' : 'side-b'}`}>
            <div className="panel-header">
                <h3>{comparisonMode ? `Side ${side} Details` : 'Selection Details'}</h3>
                <button className="close-btn" onClick={() => setInfo(null)} aria-label="Close">×</button>
            </div>
            <div className="panel-body">
                <h4 className="panel-title">{info.title}</h4>
                <span className="panel-badge">{info.type}</span>
                <div className="panel-details">
                    {info.details.map((d, i) => (
                        <div key={i} className="detail-row">
                            <span className="detail-label">{d.label}</span>
                            <span className="detail-value">{d.value}</span>
                        </div>
                    ))}
                </div>
                {(info.type === 'District' || info.type === 'Block') && (
                    <button
                        className="view-report-btn"
                        onClick={() => info.onOpenReport()}
                    >
                        View Detailed Report
                    </button>
                )}
            </div>
        </div>
    );
};

export default SelectionPanel;
