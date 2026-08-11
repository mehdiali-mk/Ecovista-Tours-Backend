import mongoose from "mongoose";

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have name."],
    unique: true,
  },
  rating: { type: Number, default: 4.5 },
  price: { type: Number, required: [true, "A tour must have price."] },
});

const Tours = mongoose.model("Tour", tourSchema);

export default Tours;
