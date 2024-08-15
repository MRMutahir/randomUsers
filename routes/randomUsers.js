// routes/randomUsers.js
import express from "express";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";
import {
  addImage,
  randomUserCreate,
  sendEmailRandomUser,
  upload,
} from "../controllers/randomUsers.js";

const randomUsers = express.Router();

randomUsers.post(
  "/register",
  body("username")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Username is required"),
  validate,
  randomUserCreate
);

randomUsers.post("/image/:token", upload.single("file"), addImage); // Token is passed as a route parameter

randomUsers.post("/email/:token", sendEmailRandomUser);

export { randomUsers };
