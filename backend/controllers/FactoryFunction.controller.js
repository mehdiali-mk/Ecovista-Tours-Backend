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
