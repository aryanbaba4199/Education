

const errorHandler = (err, req, res, next) => {
    const statusCode = err?.status || 500;
    const message = err?.message || 'Internal Server Error';
    console.error('Error Occurred', err);

     return res.status(statusCode).json({
        message: err.message,
    });
};
module.exports = errorHandler;