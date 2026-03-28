export const getChoroplethColor = (d) => {
    if (d === 0 || !d) return '#e2e8f0'; // Visible light gray for 0/no data
    return d > 5000000 ? '#00441b' :
        d > 3000000 ? '#006d2c' :
            d > 1000000 ? '#238b45' :
                d > 500000 ? '#41ae76' :
                    d > 200000 ? '#66c2a4' :
                        d > 100000 ? '#99d8c9' :
                            d > 50000 ? '#ccece6' :
                                '#f7fcfd';
};

export const getDiffChoroplethColor = (d) => {
    if (d === 0 || d === undefined || d === null) return '#cbd5e0'; // Standard gray for no change

    // Growth (Positive Delta) - Shades of Green
    if (d > 0) {
        return d > 100000 ? '#065f46' : // Emerald 800
            d > 50000 ? '#047857' : // Emerald 700
                d > 10000 ? '#10b981' : // Emerald 500
                    d > 1000 ? '#34d399' : // Emerald 400
                        '#a7f3d0';             // Emerald 200
    }

    // Loss (Negative Delta) - Shades of Red
    const absD = Math.abs(d);
    return absD > 100000 ? '#991b1b' : // Red 800
        absD > 50000 ? '#b91c1c' : // Red 700
            absD > 10000 ? '#ef4444' : // Red 500
                absD > 1000 ? '#f87171' : // Red 400
                    '#fca5a5';             // Red 200
};
