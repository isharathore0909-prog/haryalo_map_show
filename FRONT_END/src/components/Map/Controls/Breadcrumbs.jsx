import React from 'react';
import { Home, ChevronRight, ArrowLeft } from 'lucide-react';

const Breadcrumbs = ({ district, block, viewLevel, onHome, onBack, loading }) => {
    return (
        <div className="map-breadcrumb">
            <button className="breadcrumb-btn home" onClick={onHome}><Home size={18} /></button>
            {district && (
                <>
                    <ChevronRight size={16} className="separator" />
                    <span className="breadcrumb-item">{district}</span>
                </>
            )}
            {block && (
                <>
                    <ChevronRight size={16} className="separator" />
                    <span className="breadcrumb-item active">{block}</span>
                </>
            )}
            {viewLevel !== 'District' && (
                <button className="back-nav-btn" onClick={onBack}>
                    <ArrowLeft size={16} /> Back
                </button>
            )}
            {loading && <div className="loader-mini"></div>}
        </div>
    );
};

export default Breadcrumbs;
