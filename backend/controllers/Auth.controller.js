import User from "../models/Users.models.js";
import AppError from "../utils/appError.util.js";
import catchAsync from "../utils/catchAsync.util.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "node:crypto";

function signJwtToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function createSendJwtToken(user, responseStatus, response) {
  const token = signJwtToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  response.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  response
    .status(responseStatus)
    .json({ status: "success", token, data: user });
}

export const signup = catchAsync(async (request, response, next) => {
  const { name, email, password, passwordConfirm, role } = request.body;

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  createSendJwtToken(user, 200, response);
});

export const login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  // 1. Check for email and password.
  if (!email || !password) {
    return next(new AppError("Please enter email and password!", 400));
  }

  // 2. Check for actual user.
  const user = await User.findOne({ email }).select("+password");
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  createSendJwtToken(user, 200, response);
});

export const forgotPassword = catchAsync(async (request, response, next) => {
  // const { email } = request.body;
  // 1. Get User from provided email.
  const user = await User.findOne({ email: request.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email!", 404));
  }

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Sent it to user's email.
  const resetURL = `${request.protocol}://${request.get("host")}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your email?\n\nSubmit a PATCH request with your new password and confirm password to:\n\nLINK: ${resetURL}.\n\nNOTE: It is only valid for 10 minutes.\n\nIf you didn't request for this then, please ignore this email.`;

  const subject = `ECOVISTA: Reset your password with the link.`;

  try {
    await sendEmail({
      email: user.email,
      subject,
      message,
    });

    response
      .status(200)
      .json({ status: "success", message: "Token sent to email!" });
  } catch (error) {
    console.log("NODEMAILER ERROR:", error);

    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There is an error while sending email. Please try again later.",
        500,
      ),
    );
  }
});

export const resetPassword = catchAsync(async (request, response, next) => {
  // 1. Get User based on the request resetToken.
  const hashedToken = crypto
    .createHash("sha256")
    .update(request.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  // 2. If Token has expired and user not found then error.
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  await user.save();

  // 4. Login the user in and send JWT.
  createSendJwtToken(user, 200, response);
});

export const updatePassword = catchAsync(async (request, response, next) => {
  // 1. Get the user by Id.
  const user = await User.findById(request.user.id).select("+password");

  // 2. Check current password is correct or not.
  if (
    !(await user.correctPassword(request.body.passwordCurrent, user.password))
  ) {
    return next(new AppError("Your current password is Wrong!", 401));
  }

  // 3. Save the password and confirm password to the user.
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  await user.save();

  // 4. Send the jwt token back.
  createSendJwtToken(user, 200, response);
});
