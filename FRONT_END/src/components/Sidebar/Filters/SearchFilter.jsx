import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchFilter = ({ value, onChange, placeholder, isOpen, title, icon: Icon = Search }) => {
    const [localValue, setLocalValue] = useState(value);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, 500);
        return () => clearTimeout(timer);
    }, [localValue]);

    if (!isOpen) return null;

    return (
        <div className="filter-section">
            <div className="section-header">
                <Icon size={16} />
                <h3>{title}</h3>
            </div>
            <div className="search-input-wrapper">
                <input
                    type="text"
                    className="filter-select" // Reusing styles
                    placeholder={placeholder}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                />
            </div>
        </div>
    );
};

export default SearchFilter;
