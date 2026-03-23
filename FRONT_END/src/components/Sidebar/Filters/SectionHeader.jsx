import React from 'react';

const SectionHeader = ({ icon: Icon, title, isOpen }) => (
    <div className="section-header">
        <Icon size={16} />
        {isOpen && <h3>{title}</h3>}
    </div>
);

export default SectionHeader;
