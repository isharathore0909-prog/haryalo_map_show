export const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({
        error: message,
        timestamp: new Date().toISOString(),
        path: req.path
    });
};
