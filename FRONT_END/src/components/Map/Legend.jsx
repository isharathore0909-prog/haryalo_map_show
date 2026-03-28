import React from 'react';
import { Trees, TreePine, Apple, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { TYPE_COLORS } from '../../constants/mapConstants';
import './Legend.css';

const Legend = ({ viewLevel, showBoundaries, onToggleBoundaries, diffData, isDiffMode }) => {
    const diffGrowthItems = [
        { label: '> 100K', color: '#065f46', icon: TrendingUp },
        { label: '10K - 100K', color: '#10b981', icon: TrendingUp },
        { label: '< 10K', color: '#a7f3d0', icon: TrendingUp }
    ];

    const diffLossItems = [
        { label: '> 100K', color: '#991b1b', icon: TrendingDown },
        { label: '10K - 100K', color: '#ef4444', icon: TrendingDown },
        { label: '< 10K', color: '#fca5a5', icon: TrendingDown }
    ];

    const noChangeItem = { label: 'No Change', color: '#cbd5e0', icon: Minus };

    const bubbleSizes = [
        { label: '5K+', count: 5000 },
        { label: '25K+', count: 25000 },
        { label: '50K+', count: 50000 }
    ];

    const choroplethScales = [
        { label: '>5M', color: '#00441b' },
        { label: '3M - 5M', color: '#006d2c' },
        { label: '1M - 3M', color: '#238b45' },
        { label: '500K - 1M', color: '#41ae76' },
        { label: '200K - 500K', color: '#66c2a4' },
        { label: '100K - 200K', color: '#99d8c9' },
        { label: '50K - 100K', color: '#ccece6' },
        { label: '<50K', color: '#f7fcfd' }
    ];

    const getRadius = (val) => {
        const r = Math.sqrt(val) / 8;
        return Math.max(r, 6);
    };

    return (
        <div className="map-legend">
            <h4 className="legend-title">Legend</h4>
            <div className="legend-content">
                {/* Change Detection Legend */}
                {isDiffMode && (
                    <div className="legend-section diff-legend">
                        <span className="legend-subtitle">Growth / Gain</span>
                        {diffGrowthItems.map((item, index) => (
                            <div key={index} className="legend-item">
                                <div className="legend-icon-wrapper" style={{ border: `1.5px solid ${item.color}`, background: `${item.color}10`, width: '18px', height: '18px' }}>
                                    <item.icon size={10} color={item.color} strokeWidth={3} />
                                </div>
                                <span className="legend-label" style={{ fontSize: '0.75rem' }}>{item.label}</span>
                            </div>
                        ))}

                        <span className="legend-subtitle" style={{ marginTop: '8px' }}>Reduction / Loss</span>
                        {diffLossItems.map((item, index) => (
                            <div key={index} className="legend-item">
                                <div className="legend-icon-wrapper" style={{ border: `1.5px solid ${item.color}`, background: `${item.color}10`, width: '18px', height: '18px' }}>
                                    <item.icon size={10} color={item.color} strokeWidth={3} />
                                </div>
                                <span className="legend-label" style={{ fontSize: '0.75rem' }}>{item.label}</span>
                            </div>
                        ))}

                        <div className="legend-item" style={{ marginTop: '8px' }}>
                            <div className="legend-icon-wrapper" style={{ border: `1.5px solid ${noChangeItem.color}`, background: `${noChangeItem.color}10`, width: '18px', height: '18px' }}>
                                <noChangeItem.icon size={10} color={noChangeItem.color} strokeWidth={3} />
                            </div>
                            <span className="legend-label" style={{ fontSize: '0.75rem' }}>{noChangeItem.label}</span>
                        </div>

                        {viewLevel !== 'District' && (
                            <>
                                <hr className="legend-divider" style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                                <span className="legend-subtitle">Individual Site Changes</span>
                                <div className="legend-item">
                                    <div className="legend-icon-wrapper" style={{ border: '1.5px solid #10b981', background: '#10b98110' }}>
                                        <Plus size={10} color="#10b981" strokeWidth={3} />
                                    </div>
                                    <span className="legend-label" style={{ fontSize: '0.75rem' }}>New Plantation Site</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-icon-wrapper" style={{ border: '1.5px solid #ef4444', background: '#ef444410' }}>
                                        <Minus size={10} color="#ef4444" strokeWidth={3} />
                                    </div>
                                    <span className="legend-label" style={{ fontSize: '0.75rem' }}>Removed Site</span>
                                </div>
                            </>
                        )}

                        <hr className="legend-divider" style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                    </div>
                )}

                {/* District Level: Choropleth */}
                {viewLevel === 'District' && !isDiffMode && (
                    <div className="legend-section">
                        <span className="legend-subtitle">Plantation Density (District)</span>
                        <div className="choropleth-scale">
                            {choroplethScales.map((item, index) => (
                                <div key={index} className="legend-item">
                                    <span
                                        className="legend-color-box choropleth-box"
                                        style={{ backgroundColor: item.color }}
                                    ></span>
                                    <span className="legend-label">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Block Level: Proportional Bubbles */}
                {viewLevel === 'Block' && !isDiffMode && (
                    <div className="legend-section">
                        <span className="legend-subtitle">Plantation Scale (Block)</span>
                        <div className="bubble-scale">
                            {bubbleSizes.map((size, index) => (
                                <div key={index} className="bubble-item">
                                    <div
                                        className="bubble-circle-container"
                                        style={{
                                            width: 60,
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <div
                                            className="bubble-circle"
                                            style={{
                                                width: getRadius(size.count) * 2,
                                                height: getRadius(size.count) * 2
                                            }}
                                        ></div>
                                    </div>
                                    <span className="legend-label">{size.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* GP Level: Individual Plantation Type Icons */}
                {viewLevel === 'GP' && !isDiffMode && (
                    <div className="legend-section">
                        <span className="legend-subtitle">Plantation Categories</span>
                        <div className="legend-item">
                            <div className="legend-icon-wrapper" style={{ border: `1.5px solid ${TYPE_COLORS[1]}` }}>
                                <TreePine size={12} color={TYPE_COLORS[1]} fill={TYPE_COLORS[1]} fillOpacity={0.1} />
                            </div>
                            <span className="legend-label">Block Plantation</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-icon-wrapper" style={{ border: `1.5px solid ${TYPE_COLORS[2]}` }}>
                                <Trees size={12} color={TYPE_COLORS[2]} fill={TYPE_COLORS[2]} fillOpacity={0.1} />
                            </div>
                            <span className="legend-label">Miyawaki</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-icon-wrapper" style={{ border: `1.5px solid ${TYPE_COLORS[3]}` }}>
                                <Apple size={12} color={TYPE_COLORS[3]} fill={TYPE_COLORS[3]} fillOpacity={0.1} />
                            </div>
                            <span className="legend-label">Fal Vatika</span>
                        </div>
                    </div>
                )}

                <div className="legend-item interactive" onClick={() => onToggleBoundaries(!showBoundaries)}>
                    <div className={`legend-checkbox ${showBoundaries ? 'checked' : ''}`}>
                        {showBoundaries && <div className="checkmark" />}
                    </div>
                    <span className="legend-label">Administrative Boundary</span>
                </div>
            </div>
        </div>
    );
};

export default Legend;
