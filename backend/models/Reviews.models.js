import mongoose from "mongoose";
import Tours from "./Tours.models.js";

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
      set: (value) => Math.round(value * 10) / 10,
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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function () {
  this.populate({ path: "user", select: "name photo" });
});

reviewSchema.path("createdAt").select(false);
reviewSchema.path("updatedAt").select(false);

reviewSchema.statics.calculateAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        numberOfRatings: { $sum: 1 },
        averageRatings: { $avg: "$rating" },
      },
    },
  ]);

  await Tours.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats.length > 0 ? stats[0].numberOfRatings : 0,
    ratingsAverage: stats.length > 0 ? stats[0].averageRatings : 4.5,
  });
};

reviewSchema.post("save", function () {
  this.constructor.calculateAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function () {
  this.r = await this.model.findOne(this.getQuery());
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (!this.r) return;

  await this.r.constructor.calculateAverageRatings(this.r.tour);
});

const Review = new mongoose.model("Review", reviewSchema);

export default Review;
