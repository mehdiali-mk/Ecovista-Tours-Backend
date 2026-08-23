import User from "../models/Users.models.js";
import AppError from "../utils/appError.util.js";
import catchAsync from "../utils/catchAsync.util.js";
import jwt from "jsonwebtoken";

function signJwtToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

export const signup = catchAsync(async (request, response, next) => {
  const { name, email, password, passwordConfirm } = request.body;

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  const token = signJwtToken(user._id);

  response.status(200).json({ status: "success", token, data: user });
});

export const login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  // 1. Check for email and password.
  if (!email || !password) {
    return next(new AppError("Please enter email and password!", 400));
  }

  // 2. Check for actual user.
  const user = await User.findOne({ email }).select("+password");
  const correct = user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  const token = signJwtToken(user._id);

  response.status(200).json({ status: "success", token });
});
