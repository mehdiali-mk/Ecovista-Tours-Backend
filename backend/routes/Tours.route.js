import express from "express";
import {
  aggregatePipeline,
  createTour,
  deleteTour,
  getAllTours,
  getDistances,
  getMonthlyPlan,
  getTour,
  getToursWithin,
  updateTour,
} from "../controllers/Tours.controller.js";
import { top5ToursRouteAlias } from "../middlewares/Tours.middleware.js";
import authUser from "../middlewares/authUser.middleware.js";
import restrictTo from "../middlewares/restrictTo.middleware.js";
import reviewRouter from "./Review.route.js";

const toursRouter = express.Router();

// toursRouter
//   .route("/:tourId/reviews")
//   .post(authUser, restrictTo("user"), createReview);

toursRouter.use("/:tourId/reviews", reviewRouter);

toursRouter
  .route("/top-5-tours")
  .get(authUser, restrictTo("admin"), top5ToursRouteAlias, getAllTours);

toursRouter
  .route("/aggregate-pipeline")
  .get(authUser, restrictTo("admin"), aggregatePipeline);
toursRouter
  .route("/get-monthly-plan/:year")
  .get(authUser, restrictTo("admin"), getMonthlyPlan);

toursRouter
  .route("/tours-within/:distance/center/:latitudeLongitude/unit/:unit")
  .get(getToursWithin);

toursRouter.route("/distances/:latitudeLongitude/unit/:unit").get(getDistances);

toursRouter
  .route("/")
  .get(getAllTours)
  .post(authUser, restrictTo("admin", "lead-guide"), createTour);

toursRouter
  .route("/:id")
  .get(getTour)
  .patch(authUser, restrictTo("admin", "lead-guide"), updateTour)
  .delete(authUser, restrictTo("admin", "lead-guide"), deleteTour);

export default toursRouter;
