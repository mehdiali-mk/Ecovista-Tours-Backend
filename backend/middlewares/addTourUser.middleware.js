import catchAsync from "../utils/catchAsync.util.js";

const addTourUser = catchAsync(async (request, response, next) => {
  if (!request.body.tour) {
    request.body.tour = request.params.tourId;
  }

  request.body.user = request?.user?._id;
  next();
});

export default addTourUser;
