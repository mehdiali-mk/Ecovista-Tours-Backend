import express from "express";
import {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
} from "../controllers/Tours.controller.js";
import { top5ToursRouteAlias } from "../middlewares/Tours.middleware.js";

const toursRouter = express.Router();

toursRouter.route("/top-5-tours").get(top5ToursRouteAlias, getAllTours);

toursRouter.route("/").get(getAllTours).post(createTour);

toursRouter.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

export default toursRouter;
