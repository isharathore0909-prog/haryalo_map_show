import React, { useState } from 'react';
import { X, Map as MapIcon, Building, CheckCircle, Info, ShieldCheck, Timer, FileText, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import './SummaryModal.css';

const SummaryModal = ({ isOpen, onClose, summary, stats, regionName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-info">
                        <h2>{regionName} Report</h2>
                        <span className="subtitle" style={{ color: '#065f46' }}>Plantation Analytics & Administrative Performance Metrics</span>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close report"><X size={24} /></button>
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
                                                const maxVal = Math.max(...dispStats.map(s => Math.max(s.block_plants || 0, s.fal_vatika_plants || 0, s.miyawaki_plants || 0)), 1);
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
                        <div className="report-section formal">
                            <div className="section-title">
                                <Building size={20} className="section-icon" />
                                <h3>Top Contributing Departments</h3>
                            </div>
                            {summary.by_dept && Object.keys(summary.by_dept).length > 0 ? (
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

                        {/* Audit and Verification Section */}
                        <div className="report-section formal border-blue">
                            <div className="section-title">
                                <ShieldCheck size={20} className="section-icon" />
                                <h3>Audit & Verification Status</h3>
                            </div>
                            <div className="audit-card">
                                {(() => {
                                    const verified = summary.verified_count || 0;
                                    const total = summary.total_sites || 1;
                                    const percent = ((verified / total) * 100).toFixed(1);
                                    return (
                                        <>
                                            <div className="audit-header">
                                                <span className="audit-title">GEOSPATIAL VERIFICATION SCORE</span>
                                                <span className="audit-percent">{percent}%</span>
                                            </div>
                                            <div className="audit-progress-track">
                                                <div
                                                    className="audit-progress-fill"
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                            <div className="audit-summary-row">
                                                <div className="audit-pill success">
                                                    <ShieldCheck size={14} />
                                                    <span>{verified.toLocaleString()} SITES VERIFIED</span>
                                                </div>
                                                <div className="audit-pill warning">
                                                    <Timer size={14} />
                                                    <span>{(total - verified).toLocaleString()} SITES PENDING AUDIT</span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
