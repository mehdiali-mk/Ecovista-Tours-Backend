import express from "express";
import {
  createUser,
  deleteAllUsers,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/User.controller.js";
import {
  forgotPassword,
  login,
  resetPassword,
  signup,
} from "../controllers/Auth.controller.js";
import authUser from "../middlewares/authUser.middleware.js";
import restrictTo from "../middlewares/restrictTo.middleware.js";

const userRouter = express.Router();

userRouter.route("/signup").post(signup);
userRouter.route("/login").post(login);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/reset-password/:token").patch(resetPassword);

userRouter
  .route("/")
  .get(authUser, getAllUsers)
  .post(createUser)
  // .delete(authUser, restrictTo("admin"), deleteAllUsers);
  .delete(deleteAllUsers);

userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
