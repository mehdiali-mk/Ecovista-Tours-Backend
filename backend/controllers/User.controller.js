import { response } from "express";
import User from "../models/Users.models.js";
import catchAsync from "../utils/catchAsync.util.js";

export const getAllUsers = catchAsync(async (request, response, next) => {
  const allUsers = await User.find();

  response.status(200).json({
    status: "success",
    results: allUsers.length,
    data: { users: allUsers },
  });
});

export const deleteAllUsers = catchAsync(async (request, response, next) => {
  const allDeletedUsers = await User.deleteMany({});

  response.status(200).json({
    status: "success",
    deletedCount: allDeletedUsers.deletedCount,
  });
});

export function createUser(request, response) {
  response
    .status(500)
    .json({ status: "fail", message: "API not created yet!" });
}

export function getUser(request, response) {
  response
    .status(500)
    .json({ status: "fail", message: "API not created yet!" });
}

export function updateUser(request, response) {
  response
    .status(500)
    .json({ status: "fail", message: "API not created yet!" });
}

export function deleteUser(request, response) {
  response
    .status(500)
    .json({ status: "fail", message: "API not created yet!" });
}
