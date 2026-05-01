const errorHandler = (err, req, res, next) => {
    let message = err.message || "Server Error"
    let statusCode = err.statusCode || 500                

    // Mongoose bad ObjectId error handling
    if (err.name === "CastError") {
        message = "Resource Not Found";
        statusCode = 404;
    }

    // Mongoose duplicate key error handling
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate ${field} entered`;
        statusCode = 400;
    }

    // Mongoose Validation error handling
    if (err.name === "ValidationError") {
        message = Object.values(err.errors).map((val) => val.message);
        statusCode = 400;
    }

    // Multer File Size Limit Handling
    if (err.code === "LIMIT_FILE_SIZE") {
        message = "File size limit exceeded";
        statusCode = 400;
    }

    // JWT
    if (err.name === "JsonWebTokenError") {
        message = "Invalid Token";
        statusCode = 401;
    }

    if (err.name === "TokenExpiredError") {
        message = "Token expired";
        statusCode = 401;
    }

    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(statusCode).json({
      success: false,
      error: message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    });
};

export default errorHandler