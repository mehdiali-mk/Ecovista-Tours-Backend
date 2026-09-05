import express from "express";
import Tours from "../models/Tours.models.js";
import APIFeatures from "../utils/apiFeature.util.js";
import catchAsync from "../utils/catchAsync.util.js";
import AppError from "../utils/appError.util.js";
import Review from "../models/Reviews.models.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./FactoryFunction.controller.js";

export const getAllTours = getAll(Tours);
export const getTour = getOne(Tours, { path: "reviews" });
export const createTour = createOne(Tours);
export const updateTour = updateOne(Tours);
export const deleteTour = deleteOne(Tours);

export const aggregatePipeline = catchAsync(async (request, response, next) => {
  const stats = await Tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $facet: {
        allToursGroup: [
          {
            $group: {
              _id: null,
              numberOfTours: { $sum: 1 },
              numberOfRatings: { $sum: "$ratingsQuantity" },
              averageRatings: { $avg: "$ratingsAverage" },
              averagePrice: { $avg: "$price" },
              minimumPrice: { $min: "$price" },
              maximumPrice: { $max: "$price" },
            },
          },
        ],

        difficultyGroup: [
          {
            $group: {
              _id: { $toUpper: "$difficulty" },
              numberOfTours: { $sum: 1 },
              numberOfRatings: { $sum: "$ratingsQuantity" },
              averageRatings: { $avg: "$ratingsAverage" },
              averagePrice: { $avg: "$price" },
              minimumPrice: { $min: "$price" },
              maximumPrice: { $max: "$price" },
            },
          },
          { $sort: { averagePrice: -1 } },
        ],
      },
    },
  ]);

  response.status(200).json({ status: "success", data: { stats } });
});

export const getMonthlyPlan = catchAsync(async (request, response, next) => {
  const year = request.params.year * 1;

  const plan = await Tours.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numberOfTours: { $sum: 1 },
        tours: {
          $push: {
            name: "$name",
            difficulty: "$difficulty",
            duration: "$duration",
          },
        },
        averagePrice: { $avg: "$price" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numberOfTours: -1, averagePrice: -1 } },
  ]);

  response.status(200).json({ status: "success", data: { plan } });
});

export const getToursWithin = catchAsync(async (request, response, next) => {
  const { distance, latitudeLongitude, unit } = request.params;

  const [latitude, longitude] = latitudeLongitude.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!latitude || !longitude) {
    next(
      new AppError(
        "Please provide latitude or longitude in the format of lat,lng.",
        400,
      ),
    );
  }

  const tours = await Tours.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  response
    .status(200)
    .json({ status: "success", results: tours.length, data: { data: tours } });
});

export const getDistances = catchAsync(async (request, response, next) => {
  const { distance, latitudeLongitude, unit } = request.params;

  const [latitude, longitude] = latitudeLongitude.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!latitude || !longitude) {
    next(
      new AppError(
        "Please provide latitude or longitude in the format of lat,lng.",
        400,
      ),
    );
  }

  const distances = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude * 1, latitude * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  response.status(200).json({ status: "success", data: { data: distances } });
});

// export const deleteTour = catchAsync(async (request, response, next) => {
//   const deletedTour = await Tours.findByIdAndDelete(request.params.id);

//   if (!deletedTour) {
//     return next(new AppError("No tours with that ID!", 404));
//   }

//   response.status(204).json({ status: "success", data: { tour: deleteTour } });
// });

// My Logic
// export async function getMonthlyPlan(request, response) {
//   try {
//     const year = request.params.year * 1;

//     const plan = await Tours.aggregate([
//       {
//         $unwind: "$startDates",
//       },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$startDates" },
//           numberOfTours: { $sum: 1 },
//           tours: {
//             $push: {
//               name: "$name",
//               difficulty: "$difficulty",
//               duration: "$duration",
//             },
//           },
//           averagePrice: { $avg: "$price" },
//         },
//       },
//       {
//         $addFields: {
//           month: {
//             $arrayElemAt: [
//               [
//                 "", // Index 0 is empty because our month numbers start at 1, not 0
//                 "January",
//                 "February",
//                 "March",
//                 "April",
//                 "May",
//                 "June",
//                 "July",
//                 "August",
//                 "September",
//                 "October",
//                 "November",
//                 "December",
//               ],
//               "$_id", // We use the group _id (the month number) to pick the string from the array above
//             ],
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//         },
//       },
//       { $sort: { numberOfTours: -1, averagePrice: -1 } },
//     ]);

//     response.status(200).json({ status: "success", data: { plan } });
//   } catch (error) {
//     response.status(404).json({ status: "fail", message: error.message });
//   }
// }
