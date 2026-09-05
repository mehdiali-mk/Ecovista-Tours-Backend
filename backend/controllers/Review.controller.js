import Review from "../models/Reviews.models.js";
import catchAsync from "../utils/catchAsync.util.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./FactoryFunction.controller.js";

export const getAllReviews = getAll(Review);
export const getReview = getOne(Review, {
  path: "tour",
  select: "name imageCover maxGroupSize difficulty",
});
export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);
