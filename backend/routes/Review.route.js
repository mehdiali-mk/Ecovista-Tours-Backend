import express from "express";
import authUser from "../middlewares/authUser.middleware.js";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  updateReview,
} from "../controllers/Review.controller.js";
import restrictTo from "../middlewares/restrictTo.middleware.js";
import addTourUser from "../middlewares/addTourUser.middleware.js";

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authUser);

reviewRouter
  .route("/")
  .post(restrictTo("user"), addTourUser, createReview)
  .get(getAllReviews);

reviewRouter
  .route("/:id")
  .get(getReview)
  .delete(deleteReview)
  .patch(restrictTo("user", "admin"), updateReview);

export default reviewRouter;
