import { Router } from "express";
import {
  addUserToDatabase,
  getUserFromDatabase,
} from "../controllers/userController";

const userRouter = Router();

userRouter.post("/register", addUserToDatabase);
userRouter.get("/:uid", getUserFromDatabase);

export default userRouter;