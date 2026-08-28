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
  updatePassword,
} from "../controllers/Auth.controller.js";
import authUser from "../middlewares/authUser.middleware.js";
import restrictTo from "../middlewares/restrictTo.middleware.js";
import checkLoginAttempts from "../middlewares/checkLoginAttempts.middleware.js";

const userRouter = express.Router();

userRouter.route("/signup").post(signup);
userRouter.route("/login").post(checkLoginAttempts, login);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/reset-password/:token").patch(resetPassword);
userRouter.patch("/update-my-password", authUser, updatePassword);

userRouter.patch("/update-user", authUser, updateUser);

userRouter.delete("/delete-user", authUser, deleteUser);

userRouter
  .route("/")
  .get(authUser, getAllUsers)
  .post(createUser)
  // .delete(authUser, restrictTo("admin"), deleteAllUsers);
  .delete(deleteAllUsers);

userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
