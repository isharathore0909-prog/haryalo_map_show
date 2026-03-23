import React from 'react'
import { Map as MapIcon, ChevronLeft, ChevronRight, Filter, CheckCircle, Building, Landmark } from 'lucide-react'
import StatsPanel from './StatsPanel'
import SelectFilter from './Filters/SelectFilter'
import YearRangeFilter from './Filters/YearRangeFilter'
import { useFilterOptions } from '../../hooks/useFilterOptions'
import './Sidebar.css'

const Sidebar = ({
    isOpen,
    setIsOpen,
    filters,
    setFilters,
    summary,
    activeSide,
    setActiveSide,
    comparisonMode,
    setComparisonMode,
    sideA,
    sideB,
    onOpenReport
}) => {
    const { departments, landOwnerships } = useFilterOptions();

    const handleTypeChange = (typeId) => {
        setFilters(prev => ({
            ...prev,
            type: prev.type === typeId ? null : typeId
        }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === 'null' ? null : value
        }));
    };

    const plantationTypes = [
        { id: 1, label: 'Block Plantation' },
        { id: 2, label: 'Miyawaki' },
        { id: 3, label: 'Fal Vatika' }
    ];

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'} ${comparisonMode ? 'mode-comparison' : ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="sidebar-toggle"
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
                {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            <div className="sidebar-header">
                <div className="logo-container">
                    <Filter size={20} color="white" />
                </div>
                {isOpen && (
                    <div className="header-text-group">
                        <h1 className="logo-text">Dashboard</h1>
                        <div className="mode-toggle-pill" onClick={() => setComparisonMode(!comparisonMode)}>
                            <span className={!comparisonMode ? 'active' : ''}>Explorer</span>
                            <span className={comparisonMode ? 'active' : ''}>Compare</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="sidebar-content">
                {comparisonMode && isOpen && (
                    <div className="side-switcher">
                        <button
                            className={`switch-btn side-a ${activeSide === 'A' ? 'active' : ''}`}
                            onClick={() => setActiveSide('A')}
                        >
                            Side A
                        </button>
                        <button
                            className={`switch-btn side-b ${activeSide === 'B' ? 'active' : ''}`}
                            onClick={() => setActiveSide('B')}
                        >
                            Side B
                        </button>
                    </div>
                )}

                <StatsPanel
                    totalPlants={summary.total_plants}
                    totalSites={summary.total_sites}
                    isOpen={isOpen}
                    accentColor={comparisonMode ? (activeSide === 'A' ? '#3b82f6' : '#10b981') : null}
                    regionName={activeSide === 'A' ? (sideA.selection.blockName || sideA.selection.districtName || 'Rajasthan') : (sideB.selection.blockName || sideB.selection.districtName || 'Rajasthan')}
                    onOpenReport={() => onOpenReport(activeSide)}
                />

                <div className="scroll-area">
                    {/* Category Filter */}
                    <div className="filter-section">
                        <div className="section-header">
                            <MapIcon size={16} />
                            {isOpen && <h3>Plantation Category</h3>}
                        </div>
                        {isOpen && (
                            <div className="checkbox-group">
                                {plantationTypes.map(t => (
                                    <label key={t.id} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={filters.type == t.id}
                                            onChange={() => handleTypeChange(t.id)}
                                        />
                                        <span>{t.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <SelectFilter
                        title="Verification Status"
                        icon={CheckCircle}
                        value={filters.status}
                        onChange={(val) => handleFilterChange('status', val)}
                        isOpen={isOpen}
                        placeholder="All Status"
                        options={[
                            { id: 'true', label: 'Verified' },
                            { id: 'false', label: 'Non-Verified' }
                        ]}
                    />

                    <YearRangeFilter
                        fromDate={filters.from_date}
                        toDate={filters.to_date}
                        onChange={handleFilterChange}
                        isOpen={isOpen}
                    />

                    <SelectFilter
                        title="Department"
                        icon={Building}
                        value={filters.department}
                        onChange={(val) => handleFilterChange('department', val)}
                        isOpen={isOpen}
                        placeholder="All Departments"
                        options={departments}
                    />

                    <SelectFilter
                        title="Land Ownership"
                        icon={Landmark}
                        value={filters.land_ownership}
                        onChange={(val) => handleFilterChange('land_ownership', val)}
                        isOpen={isOpen}
                        placeholder="All Ownership Types"
                        options={landOwnerships}
                    />
                </div>
            </div>

            <div className="sidebar-footer">
                {isOpen && <div className="footer-info">© 2026 Plantation Monitor</div>}
            </div>
        </div>
    )
}

export default Sidebar


