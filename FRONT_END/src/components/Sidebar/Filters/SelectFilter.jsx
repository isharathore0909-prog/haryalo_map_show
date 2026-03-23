import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const SelectFilter = ({ value, onChange, options, placeholder, isOpen, icon: Icon, title }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleSelect = (val) => {
        onChange(val);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const getLabel = (opt) => opt?.label || opt?.department_name || opt?.land_ownership || '';

    const selectedOption = options.find(opt => String(opt.id) === String(value));
    const filteredOptions = options.filter(opt =>
        getLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="filter-section custom-select-wrapper" ref={dropdownRef}>
            <div className="section-header">
                <Icon size={16} />
                <h3>{title}</h3>
            </div>

            <div
                className={`custom-select-box ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <span className="selected-text">
                    {selectedOption ? getLabel(selectedOption) : placeholder}
                </span>
                <ChevronDown size={16} className={`chevron-icon ${isDropdownOpen ? 'rotate' : ''}`} />
            </div>

            {isDropdownOpen && (
                <div className="custom-dropdown-panel" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown-search-box">
                        <Search size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="dropdown-options-list">
                        <div
                            className={`option-item ${value === null ? 'selected' : ''}`}
                            onClick={() => handleSelect('null')}
                        >
                            {placeholder}
                        </div>
                        {filteredOptions.map(opt => (
                            <div
                                key={opt.id}
                                className={`option-item ${String(opt.id) === String(value) ? 'selected' : ''}`}
                                onClick={() => handleSelect(opt.id)}
                                title={getLabel(opt)} // Tooltip for full text
                            >
                                {getLabel(opt)}
                            </div>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className="no-matches">No matches found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectFilter;
