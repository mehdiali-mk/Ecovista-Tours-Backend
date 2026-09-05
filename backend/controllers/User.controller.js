import { response } from "express";
import User from "../models/Users.models.js";
import catchAsync from "../utils/catchAsync.util.js";
import { request } from "http";
import AppError from "../utils/appError.util.js";
import { getAll, getOne, updateOne } from "./FactoryFunction.controller.js";

export const deleteAllUsers = catchAsync(async (request, response, next) => {
  const allDeletedUsers = await User.deleteMany({});

  response.status(200).json({
    status: "success",
    deletedCount: allDeletedUsers.deletedCount,
  });
});

export const getMe = catchAsync(async (request, response, next) => {
  request.params.id = request.user.id;
  next();
});
export const getAllUsers = getAll(User);
export const getUser = getOne(User);
export const updateUser = updateOne(User);

// export const updateUser = catchAsync(async (request, response, next) => {
//   // 1. Check if the user changing the password or not.
//   if (request.body.password || request.body.passwordConfirm) {
//     return next(new AppError("Not for updating password!", 400));
//   }

//   // 2. Remove fields that are not allowed to update.
//   const filteredBody = filterObject(request.body, "name", "email");

//   // 3. Actually update the user.
//   const updatedUser = await User.findByIdAndUpdate(
//     request.user.id,
//     filteredBody,
//     {
//       new: true,
//       runValidators: true,
//     },
//   );

//   response.status(200).json({ status: "success", data: { user: updatedUser } });
// });

// export const deleteUser = catchAsync(await (request, response, next) => {

// })

export const deleteUser = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({ status: "success" });
});

export function createUser(request, response) {
  response
    .status(500)
    .json({ status: "fail", message: "Can't create user from this api." });
}
