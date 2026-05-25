import React, { useState, useRef, useEffect } from 'react';
import { X, Map as MapIcon, Building, CheckCircle, Info, FileText, BarChart3, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { mapService } from '../../api/mapService';
import './SummaryModal.css';

const SummaryModal = ({ isOpen, onClose, summary, stats, regionName, filters, selection }) => {
    const { departments } = useFilterOptions();
    const [isDownloading, setIsDownloading] = useState(false);
    const reportRef = useRef(null);
    const [unfilteredSummary, setUnfilteredSummary] = useState(null);
    const [isLoadingUnfiltered, setIsLoadingUnfiltered] = useState(false);

    const selectedDeptObj = departments?.find(d => String(d.id) === String(filters?.department));
    const departmentName = selectedDeptObj?.department_name || selectedDeptObj?.label || filters?.department;

    useEffect(() => {
        if (isOpen && filters?.department) {
            const fetchUnfiltered = async () => {
                setIsLoadingUnfiltered(true);
                try {
                    const unfilteredFilters = { ...filters, department: null };
                    const data = await mapService.fetchSummaryStats(
                        unfilteredFilters,
                        selection?.district,
                        selection?.block
                    );
                    setUnfilteredSummary(data);
                } catch (error) {
                    console.error("Failed to fetch unfiltered stats:", error);
                } finally {
                    setIsLoadingUnfiltered(false);
                }
            };
            fetchUnfiltered();
        } else {
            setUnfilteredSummary(null);
        }
    }, [isOpen, filters?.department, selection?.district, selection?.block]);

    if (!isOpen) return null;

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setIsDownloading(true);
        try {
            await exportToPDF(reportRef.current, `${regionName}_Report.pdf`);
        } catch (error) {
            console.error('PDF Generation failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} ref={reportRef}>
                <div className="modal-header">
                    <div className="header-info">
                        <h2>{regionName} Report</h2>
                        {filters?.department && (
                            <div className="report-dept-badge" style={{
                                display: 'inline-block',
                                background: '#ecfdf5',
                                border: '1px solid #10b981',
                                color: '#065f46',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                marginTop: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Department: {departmentName}
                            </div>
                        )}
                        <span className="subtitle" style={{ color: '#065f46', marginTop: filters?.department ? '8px' : '6px' }}>Plantation Analytics & Administrative Performance Metrics</span>
                    </div>
                    <div className="modal-actions">
                        <button
                            className={`download-btn ${isDownloading ? 'loading' : ''}`}
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            title="Download PDF Report"
                        >
                            {isDownloading ? 'Processing...' : <><Download size={18} /> Download PDF</>}
                        </button>
                        <button className="modal-close" onClick={onClose} aria-label="Close report"><X size={24} /></button>
                    </div>
                </div>

                <div className="modal-body">
                    {/* Executive Summary Section */}
                    <div className="executive-stats-grid">
                        <div className="executive-stat-card">
                            <div className="card-data">
                                <span className="card-val">+{summary.total_plants?.toLocaleString() || 0}</span>
                                <span className="card-label">TOTAL PLANTS</span>
                            </div>
                        </div>
                        <div className="executive-stat-card">
                            <div className="card-data">
                                <span className="card-val">+{summary.total_sites?.toLocaleString() || 0}</span>
                                <span className="card-label">TOTAL SITES</span>
                            </div>
                        </div>
                        <div className="executive-stat-card">
                            <div className="card-data">
                                <span className="card-val">+{summary.total_species?.toLocaleString() || 0}</span>
                                <span className="card-label">PLANT SPECIES</span>
                            </div>
                        </div>
                    </div>

                    <div className="report-sections">
                        {/* Regional Individual vs Block Chart & Table */}
                        {stats && stats.length > 0 && (
                            <div className="report-section formal">
                                <div className="section-title">
                                    <BarChart3 size={20} className="section-icon" />
                                    <h3>Regional Plantation Comparison</h3>
                                </div>
                                <div className="vertical-chart-layout">
                                    <div className="regional-chart-section full-width">
                                        <div className="regional-bar-container">
                                            {(() => {
                                                const dispStats = stats.slice(0, 15); // Show more in vertical layout
                                                const maxVal = Math.max(...dispStats.map(s => Math.max(s.block_plants || 0, s.fal_vatika_plants || 0, s.miyawaki_plants || 0, s.individual_plants || 0)), 1);
                                                return (
                                                    <>
                                                        <div className="bar-y-axis">
                                                            <span>{maxVal.toLocaleString()}</span>
                                                            <span>{Math.round(maxVal / 2).toLocaleString()}</span>
                                                            <span>0</span>
                                                        </div>
                                                        <div className="bar-x-plot">
                                                            {dispStats.map(s => (
                                                                <div key={s.code} className="bar-group-triple larger">
                                                                    <div className="bars-wrap triple">
                                                                        <div className="bar-col blk-col" style={{ height: `${((s.block_plants || 0) / maxVal) * 100}%` }} title={`Block: ${s.block_plants}`}></div>
                                                                        <div className="bar-col fal-col" style={{ height: `${((s.fal_vatika_plants || 0) / maxVal) * 100}%` }} title={`Fal Vatika: ${s.fal_vatika_plants}`}></div>
                                                                        <div className="bar-col miy-col" style={{ height: `${((s.miyawaki_plants || 0) / maxVal) * 100}%` }} title={`Miyawaki: ${s.miyawaki_plants}`}></div>
                                                                        <div className="bar-col ind-col" style={{ height: `${((s.individual_plants || 0) / maxVal) * 100}%` }} title={`Individual: ${s.individual_plants}`}></div>
                                                                    </div>
                                                                    <span className="x-label" title={s.name}>{s.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                        <div className="chart-legend-bottom">
                                            <div className="legend-blob blk"><span className="swatch"></span> Block</div>
                                            <div className="legend-blob fal"><span className="swatch"></span> Fal Vatika</div>
                                            <div className="legend-blob miy"><span className="swatch"></span> Miyawaki</div>
                                            <div className="legend-blob ind"><span className="swatch"></span> Individual</div>
                                        </div>
                                    </div>
                                    <div className="regional-table-section full-width spaced-top">
                                        <table className="gov-data-table">
                                            <thead>
                                                <tr>
                                                    <th>Code</th>
                                                    <th>Region Name</th>
                                                    <th>Block</th>
                                                    <th>Fal Vatika</th>
                                                    <th>Miyawaki</th>
                                                    <th>Individual</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.slice(0, 10).map((s) => (
                                                    <tr key={s.code}>
                                                        <td>{s.code}</td>
                                                        <td>{s.name}</td>
                                                        <td className="count-col">{(s.block_plants || 0).toLocaleString()}</td>
                                                        <td className="count-col">{(s.fal_vatika_plants || 0).toLocaleString()}</td>
                                                        <td className="count-col">{(s.miyawaki_plants || 0).toLocaleString()}</td>
                                                        <td className="count-col">{(s.individual_plants || 0).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {stats.length > 10 && <div className="pagination-info">Showing 1 to 10 of {stats.length} entries</div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top 5 Departments Bar Chart & Full Table */}
                        {/* Top 5 Departments Bar Chart & Full Table */}
                        {!filters?.department && (
                            <div className="report-section formal">
                                <div className="section-title">
                                    <Building size={20} className="section-icon" />
                                    <h3>Top Contributing Departments</h3>
                                </div>
                                {summary?.by_dept && Object.keys(summary.by_dept).length > 0 ? (
                                    <div className="dept-chart-layout">
                                        <div className="dept-chart-section">
                                            <div className="regional-bar-container">
                                                {(() => {
                                                    const sortedDepts = Object.entries(summary.by_dept)
                                                        .sort((a, b) => b[1] - a[1])
                                                        .slice(0, 5);
                                                    const maxVal = Math.max(...sortedDepts.map(d => d[1]), 1);
                                                    const colors = ['#3b82f6', '#10b981', '#06b6d4', '#eab308', '#ef4444'];
                                                    return (
                                                        <>
                                                            <div className="bar-y-axis">
                                                                <span>{maxVal.toLocaleString()}</span>
                                                                <span>{Math.round(maxVal / 2).toLocaleString()}</span>
                                                                <span>0</span>
                                                            </div>
                                                            <div className="bar-x-plot">
                                                                {sortedDepts.map((d, i) => (
                                                                    <div key={d[0]} className="bar-group-single">
                                                                        <div className="bars-wrap single">
                                                                            <div className="bar-col full" style={{ height: `${(d[1] / maxVal) * 100}%`, backgroundColor: colors[i % colors.length] }} title={`${d[0]}: ${d[1].toLocaleString()}`}></div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                            <div className="chart-legend-bottom vertical">
                                                {(() => {
                                                    const top5 = Object.entries(summary.by_dept).sort((a, b) => b[1] - a[1]).slice(0, 5);
                                                    const colors = ['#3b82f6', '#10b981', '#06b6d4', '#eab308', '#ef4444'];
                                                    return top5.map((d, i) => (
                                                        <div key={d[0]} className="legend-blob"><span className="swatch" style={{ backgroundColor: colors[i] }}></span> {d[0]}</div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                        <div className="dept-table-section">
                                            <table className="gov-data-table styled-green">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>DEPARTMENT NAME</th>
                                                        <th>TOTAL SITES</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(summary.by_dept)
                                                        .sort((a, b) => b[1] - a[1]) // Sort by count desc
                                                        .slice(0, 10) // Show only top 10
                                                        .map(([name, count], index) => (
                                                            <tr key={name}>
                                                                <td>{index + 1}</td>
                                                                <td className="dept-name-cell">{name}</td>
                                                                <td className="count-cell">{count.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-data-msg">No administrative data available for the current selection.</div>
                                )}
                            </div>
                        )}

                        {/* Selected Department Contribution Comparison Component */}
                        {filters?.department && (
                            <div className="report-section formal animate-fade-in">
                                <div className="section-title">
                                    <Building size={20} className="section-icon" />
                                    <h3>Department Contribution Comparison</h3>
                                </div>
                                {(() => {
                                    if (isLoadingUnfiltered) {
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '16px' }}>
                                                <div className="download-btn loading" style={{ background: '#059669', width: '40px', height: '40px', borderRadius: '50%', pointerEvents: 'none' }}></div>
                                                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Loading comparison statistics...</span>
                                            </div>
                                        );
                                    }

                                    const byDept = unfilteredSummary?.by_dept;
                                    if (!byDept || Object.keys(byDept).length === 0) {
                                        return <div className="no-data-msg">No comparison data available for this department selection.</div>;
                                    }

                                    const allDeptsSorted = Object.entries(byDept).sort((a, b) => b[1] - a[1]);
                                    const selectedIndex = allDeptsSorted.findIndex(([name]) => name.toLowerCase() === departmentName?.toLowerCase());
                                    const isSelectedInTop10 = selectedIndex >= 0 && selectedIndex < 10;

                                    let displayDepts = allDeptsSorted.slice(0, 10);
                                    if (selectedIndex >= 10) {
                                        displayDepts.push(allDeptsSorted[selectedIndex]);
                                    } else if (selectedIndex === -1 && departmentName) {
                                        displayDepts.push([departmentName, 0]);
                                    }

                                    const maxVal = Math.max(...displayDepts.map(d => d[1]), 1);

                                    return (
                                        <div className="dept-chart-layout">
                                            <div className="dept-chart-section">
                                                <div className="regional-bar-container">
                                                    <div className="bar-y-axis">
                                                        <span>{maxVal.toLocaleString()}</span>
                                                        <span>{Math.round(maxVal / 2).toLocaleString()}</span>
                                                        <span>0</span>
                                                    </div>
                                                    <div className="bar-x-plot">
                                                        {displayDepts.map(([name, count]) => {
                                                            const isSelected = name.toLowerCase() === departmentName?.toLowerCase();
                                                            const barColor = isSelected ? '#f59e0b' : '#3b82f6';
                                                            return (
                                                                <div key={name} className="bar-group-single" style={{ position: 'relative' }}>
                                                                    <div className="bars-wrap single">
                                                                        <div
                                                                            className="bar-col full"
                                                                            style={{
                                                                                height: `${(count / maxVal) * 100}%`,
                                                                                backgroundColor: barColor,
                                                                                boxShadow: isSelected ? '0 0 12px #f59e0b88' : 'none',
                                                                                border: isSelected ? '1px solid #d97706' : 'none',
                                                                                borderRadius: '3px 3px 0 0'
                                                                            }}
                                                                            title={`${name}: ${count.toLocaleString()} sites (${isSelected ? 'Selected, ' : ''}Rank #${selectedIndex >= 0 ? selectedIndex + 1 : 'N/A'})`}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="chart-legend-bottom vertical">
                                                    <div className="legend-blob" style={{ color: '#047857' }}>
                                                        <span className="swatch" style={{ backgroundColor: '#f59e0b', border: '1px solid #d97706' }}></span>
                                                        <strong>{departmentName}</strong>
                                                    </div>
                                                    <div className="legend-blob">
                                                        <span className="swatch" style={{ backgroundColor: '#3b82f6' }}></span>
                                                        Other Participating Departments (Top 10)
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="dept-table-section">
                                                <table className="gov-data-table styled-green">
                                                    <thead>
                                                        <tr>
                                                            <th>Rank</th>
                                                            <th>DEPARTMENT NAME</th>
                                                            <th>TOTAL SITES</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {displayDepts.map(([name, count]) => {
                                                            const actualRank = allDeptsSorted.findIndex(([n]) => n === name) + 1;
                                                            const isSelected = name.toLowerCase() === departmentName?.toLowerCase();
                                                            return (
                                                                <tr
                                                                    key={name}
                                                                    style={{
                                                                        backgroundColor: isSelected ? '#fef3c7' : 'transparent',
                                                                        fontWeight: isSelected ? '700' : 'normal',
                                                                        borderLeft: isSelected ? '4px solid #f59e0b' : 'none'
                                                                    }}
                                                                >
                                                                    <td style={{ color: isSelected ? '#b45309' : 'inherit' }}>{actualRank || 'N/A'}</td>
                                                                    <td className="dept-name-cell" style={{ color: isSelected ? '#b45309' : 'inherit' }}>
                                                                        {name}
                                                                    </td>
                                                                    <td className="count-col" style={{ color: isSelected ? '#b45309' : 'inherit' }}>{count.toLocaleString()}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
