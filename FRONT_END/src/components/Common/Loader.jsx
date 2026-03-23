import React from 'react';

const Loader = ({ mini }) => (
    <div className={mini ? "loader-mini" : "loader-overlay"}>
        <div className="spinner"></div>
    </div>
);

export default Loader;
