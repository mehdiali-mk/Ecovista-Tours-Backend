import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide your ratings!"],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function () {
  this.populate({ path: "user", select: "name photo" });
});

reviewSchema.path("createdAt").select(false);
reviewSchema.path("updatedAt").select(false);

const Review = new mongoose.model("Review", reviewSchema);

export default Review;
