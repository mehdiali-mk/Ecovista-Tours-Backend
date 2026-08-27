import AppError from "../utils/appError.util.js";

export default function restrictTo(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action!", 403),
      );
    }

    next();
  };
}
