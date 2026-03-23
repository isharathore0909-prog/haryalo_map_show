import React from 'react';
import { Calendar } from 'lucide-react';

const YearRangeFilter = ({ fromDate, toDate, onChange, isOpen }) => {
    if (!isOpen) return null;

    const years = [2024, 2025, 2026];

    return (
        <div className="filter-section">
            <div className="section-header">
                <Calendar size={16} />
                <h3>Year Range</h3>
            </div>
            <div className="range-group">
                <select
                    className="filter-select mini"
                    value={fromDate || ''}
                    onChange={(e) => onChange('from_date', e.target.value)}
                >
                    <option value="">From</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select
                    className="filter-select mini"
                    value={toDate || ''}
                    onChange={(e) => onChange('to_date', e.target.value)}
                >
                    <option value="">To</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
    );
};

export default YearRangeFilter;
