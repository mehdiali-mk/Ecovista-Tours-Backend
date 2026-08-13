import express from "express";
import Tours from "../models/Tours.models.js";
import APIFeatures from "../utils/apiFeature.utils.js";

export async function createTour(request, response) {
  try {
    const newTour = await Tours.create(request.body);

    response.status(200).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    response.status(400).json({ status: "fail", message: "Invalid Data!" });
  }
}

export async function getAllTours(request, response) {
  try {
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
  } catch (error) {
    response.status(404).json({ status: "fail", message: error.message });
  }
}

export async function getTour(request, response) {
  try {
    const tour = await Tours.findById(request.params.id);

    response.status(200).json({ status: "success", data: { tour } });
  } catch (error) {
    response.status(404).json({ status: "fail", message: error.message });
  }
}

export async function updateTour(request, response) {
  try {
    const updatedTour = await Tours.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      },
    );

    response
      .status(200)
      .json({ status: "success", data: { tour: updatedTour } });
  } catch (error) {
    response.status(404).json({ status: "fail", message: error.message });
  }
}

export async function deleteTour(request, response) {
  try {
    await Tours.findByIdAndDelete(request.params.id);

    response.status(204).json({ status: "success", data: null });
  } catch (error) {
    response.status(404).json({ status: "fail", message: error.message });
  }
}
