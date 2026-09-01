import AppError from "../utils/appError.util.js";
import catchAsync from "../utils/catchAsync.util.js";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../models/Users.models.js";

const authUser = catchAsync(async (request, response, next) => {
  let token;

  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    token = request.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Please login to continue!", 401));
  }

  //   Verify Token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //   Is User Exists
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(new AppError("The user with token doesn't exists!", 401));
  }

  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError("User recently changed password! Please login again.", 401),
    );
  }

  request.user = currentUser;
  next();
});

export default authUser;
