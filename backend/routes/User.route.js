import express from "express";
import {
  createUser,
  deleteAllUsers,
  deleteUser,
  getAllUsers,
  getMe,
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
import updateUserAllowedFields from "../middlewares/updateUserAllowedFields.middleware.js";

const userRouter = express.Router();

userRouter.route("/signup").post(signup);
userRouter.route("/login").post(checkLoginAttempts, login);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/reset-password/:token").patch(resetPassword);

userRouter.use(authUser);

userRouter.patch("/update-my-password", updatePassword);
userRouter.patch(
  "/update-user",
  updateUserAllowedFields("name", "email"),
  updateUser,
);
userRouter.delete("/delete-user", deleteUser);
userRouter.get("/me", getMe, getUser);

userRouter.route("/").get(getAllUsers).post(createUser).delete(deleteAllUsers);

userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
