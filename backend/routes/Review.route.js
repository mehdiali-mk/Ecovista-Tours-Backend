import express from "express";
import authUser from "../middlewares/authUser.middleware.js";
import {
  createReview,
  deleteReview,
  getAllReviews,
  updateReview,
} from "../controllers/Review.controller.js";
import restrictTo from "../middlewares/restrictTo.middleware.js";

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter
  .route("/")
  .post(authUser, restrictTo("user"), createReview)
  .get(getAllReviews);

reviewRouter
  .route("/:id")
  .delete(authUser, deleteReview)
  .patch(authUser, updateReview);

export default reviewRouter;
