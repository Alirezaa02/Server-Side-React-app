const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
};

module.exports = errorHandler;
