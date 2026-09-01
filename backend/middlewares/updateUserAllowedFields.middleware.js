import AppError from "../utils/appError.util.js";
import catchAsync from "../utils/catchAsync.util.js";

function filterObject(object, ...allowedFields) {
  const newObject = {};
  Object.keys(object).forEach((element) => {
    if (allowedFields.includes(element)) newObject[element] = object[element];
  });
  return newObject;
}

export default function updateUserAllowedFields(...allowedFields) {
  return catchAsync(async (request, response, next) => {
    // 1. Check if the user changing the password or not.
    if (request.body.password || request.body.passwordConfirm) {
      return next(new AppError("Not for updating password!", 400));
    }

    // 2. Remove fields that are not allowed to update.
    const filteredBody = filterObject(request.body, ...allowedFields);

    request.body = filteredBody;
    next();
  });
}
