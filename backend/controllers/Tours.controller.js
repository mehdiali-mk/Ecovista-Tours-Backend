import express from "express";
import Tours from "../models/Tours.models.js";
import APIFeatures from "../utils/apiFeature.util.js";
import catchAsync from "../utils/catchAsync.util.js";
import AppError from "../utils/appError.util.js";
import Review from "../models/Reviews.models.js";
import { deleteOne, updateOne } from "./FactoryFunction.controller.js";

export const createTour = catchAsync(async (request, response, next) => {
  const newTour = await Tours.create(request.body);

  response.status(200).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

export const getAllTours = catchAsync(async (request, response, next) => {
  /*
    
    // 1 A) Basic Filtering
    const queryObject = { ...request.query };

    console.log(request.query);

    const excludeFields = ["page", "limit", "sort", "fields"];
    excludeFields.forEach((element) => delete queryObject[element]);

    // Advanced Filtering
    // 1 B) Advanced Filtering (add $ to gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tours.find(JSON.parse(queryStr));

    // Sorting
    if (request.query.sort) {
      const sortBy = request.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Adding or Removing the fields.
    if (request.query.fields) {
      const fields = request.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }


    // Paging the Query.
    const page = request.query.page * 1 || 1;
    const limit = request.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (request.query.page) {
      const totalTour = await Tours.countDocuments();
      if (skip >= totalTour) throw new Error("This page does not exist.");
    }
    
    */

  const features = new APIFeatures(Tours.find(), request.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const tours = await features.query;

  response
    .status(200)
    .json({ status: "success", results: tours.length, data: { tours } });
});

export const getTour = catchAsync(async (request, response, next) => {
  const tour = await Tours.findById(request.params.id).populate({
    path: "reviews",
  });

  if (!tour) {
    return next(new AppError("No tours with that ID!", 404));
  }

  response.status(200).json({ status: "success", data: { tour } });
});

export const updateTour = updateOne(Tours);
export const deleteTour = deleteOne(Tours);

// export const deleteTour = catchAsync(async (request, response, next) => {
//   const deletedTour = await Tours.findByIdAndDelete(request.params.id);

//   if (!deletedTour) {
//     return next(new AppError("No tours with that ID!", 404));
//   }

//   response.status(204).json({ status: "success", data: { tour: deleteTour } });
// });

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
