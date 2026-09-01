import Review from "../models/Reviews.models.js";
import catchAsync from "../utils/catchAsync.util.js";
import { deleteOne, updateOne } from "./FactoryFunction.controller.js";

export const createReview = catchAsync(async (request, response, next) => {
  if (!request.body.tour) {
    request.body.tour = request.params.tourId;
  }

  const { review, rating, tour } = request.body;
  const user = request?.user;

  const createdReview = await Review.create({
    review,
    rating,
    tour,
    user: user._id,
  });

  response
    .status(200)
    .json({ status: "success", data: { review: createdReview } });
});

export const getAllReviews = catchAsync(async (request, response, next) => {
  let filter = {};
  if (request.params.tourId) filter = { tour: request.params.tourId };

  const reviews = await Review.find(filter);

  response
    .status(200)
    .json({ status: "success", results: reviews.length, data: { reviews } });
});

export const deleteReview = deleteOne(Review);
export const updateReview = updateOne(Review);
