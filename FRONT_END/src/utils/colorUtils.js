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
