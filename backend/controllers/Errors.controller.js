import AppError from "../utils/appError.util.js";

function sendErrorInDevelopment(error, response) {
  response.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stackTrace: error.stack,
  });
}

function sendErrorInProduction(error, response) {
  if (error.isOperational) {
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    response.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
}

export function globalErrorHandler(error, request, response, next) {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorInDevelopment(error, response);
  } else if (process.env.NODE_ENV === "production") {
    let myCustomError = error;

    if (myCustomError?.name === "CastError") {
      myCustomError = handleCastErrorDB(error);
    }

    if (
      myCustomError?.code === 11000 ||
      myCustomError?.errorResponse?.code === 11000
    ) {
      myCustomError = handleDuplicateFieldsDB(error);
    }

    if (myCustomError?.name === "ValidationError") {
      myCustomError = handleValidationErrorDB(error);
    }

    if (myCustomError?.name === "JsonWebTokenError") {
      myCustomError = handleJsonWebTokenError();
    }

    if (myCustomError?.name === "TokenExpiredError") {
      myCustomError = handleJsonWebTokenExpiredError();
    }

    sendErrorInProduction(myCustomError, response);
  }
}

function handleCastErrorDB(error) {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(error) {
  const duplicateValue =
    error?.keyValue && Object.keys(error.keyValue).length
      ? Object.values(error.keyValue)[0]
      : null;

  const fallbackValue = error?.errorResponse?.errmsg
    ? error.errorResponse.errmsg.match(/([\'\"])(.*?)\1/)?.[0]?.slice(1, -1)
    : null;

  const value = duplicateValue || fallbackValue || "already exists";
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
}

function handleValidationErrorDB(error) {
  const errors = Object.values(error.errors).map((element) => element.message);

  const message = `Invalid data input: ${errors.join(". ")}`;
  return new AppError(message, 400);
}

function handleJsonWebTokenError() {
  return new AppError("Invalid Attempt. Please login again!", 401);
}

function handleJsonWebTokenExpiredError() {
  return new AppError("Session Expired. Please login again!", 401);
}
