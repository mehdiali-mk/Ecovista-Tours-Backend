import express from "express";
import {
  createUser,
  deleteAllUsers,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/User.controller.js";
import { login, signup } from "../controllers/Auth.controller.js";
import authUser from "../middlewares/authUser.middleware.js";

const userRouter = express.Router();

userRouter.route("/signup").post(signup);
userRouter.route("/login").post(login);

userRouter
  .route("/")
  .get(authUser, getAllUsers)
  .post(createUser)
  .delete(deleteAllUsers);

userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
