import APIFeatures from "../utils/apiFeature.util.js";
import AppError from "../utils/appError.util.js";
import catchAsync from "../utils/catchAsync.util.js";

export function deleteOne(Model) {
  return catchAsync(async (request, response, next) => {
    const deletedDocument = await Model.findByIdAndDelete(request.params.id);

    if (!deletedDocument) {
      return next(new AppError("No document with that ID!", 404));
    }

    response.status(204).json({ status: "success", data: null });
  });
}

export function updateOne(Model) {
  return catchAsync(async (request, response, next) => {
    let updateDocumentId = !request.params.id
      ? request.user.id
      : request.params.id;

    const updatedDocument = await Model.findByIdAndUpdate(
      updateDocumentId,
      request.body,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedDocument) {
      return next(new AppError("No document with that ID!", 404));
    }

    response
      .status(200)
      .json({ status: "success", data: { data: updatedDocument } });
  });
}

export function createOne(Model) {
  return catchAsync(async (request, response, next) => {
    const newDocument = await Model.create(request.body);

    response.status(200).json({
      status: "success",
      data: {
        data: newDocument,
      },
    });
  });
}

export function getOne(Model, populateOptions) {
  return catchAsync(async (request, response, next) => {
    let query = Model.findById(request.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;

    if (!document) {
      return next(new AppError("No Document with that ID!", 404));
    }

    response.status(200).json({ status: "success", data: { data: document } });
  });
}

export function getAll(Model) {
  return catchAsync(async (request, response, next) => {
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

    let filter = {};
    if (request?.params?.tourId) filter = { tour: request.params.tourId };
    if (request?.user?.role == "user") filter.user = request.user._id;

    const features = new APIFeatures(Model.find(filter), request.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const documents = await features.query;

    response.status(200).json({
      status: "success",
      results: documents.length,
      data: { data: documents },
    });
  });
}
