// controllers/randomUsers.js
import path from "path";
import fs from "fs";
import multer from "multer";
import { sendResponse } from "../helpers/common.js";
import {
  findByEmail,
  findRandomUserAndUpdate,
  randomUsersCreate,
} from "../services/randomUsers.js";
import { signToken, verifyToken } from "../config/jwt.js";
import { sendEmail } from "../helpers/mailtrap.js";

const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const randomUserCreate = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    // Initial user creation without email
    const newUser = await randomUsersCreate({
      userName: username,
      email: email || null, // Ensure email is either null or provided
    });

    const JwtPayload = {
      id: newUser._id.toString(), // Convert ObjectId to string
      userName: newUser.userName,
    };
    const authToken = await signToken(JwtPayload);
    return sendResponse(res, "Random user created successfully", true, 200, {
      newUser,
      authToken,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return sendResponse(res, "Email already exists", false, 400);
    }
    next(error); // Handle other errors
  }
};

const addImage = async (req, res, next) => {
  try {
    const token = req.params.token;

    // Check if token is provided
    if (!token) {
      return sendResponse(res, "No token provided", false, 400);
    }

    // Verify the token
    const user = await verifyToken(token);
    if (!user) {
      // If token is not valid or expired
      return sendResponse(res, "Invalid or expired token", false, 401);
    }

    // Check if a file was uploaded
    if (!req.file) {
      return sendResponse(res, "No file uploaded", false, 400);
    }

    // Extract file details
    const { filename, path: filePath, mimetype } = req.file;

    // Update user with the uploaded image
    const updatedUser = await findRandomUserAndUpdate(user.id, {
      image: filePath,
    });

    // Check if the user update was successful
    if (!updatedUser) {
      return sendResponse(res, "Failed to update user image", false, 500);
    }

    // Send success response
    return sendResponse(res, "User image added successfully", true, 200, {
      filename,
      filePath,
      mimetype,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error(error); // Log error for debugging
    return sendResponse(res, "An unexpected error occurred", false, 500);
  }
};

const sendEmailRandomUser = async (req, res, next) => {
  try {
    const token = req.params.token;
    const email = req.body.email;
    if (!token) {
      return sendResponse(res, "No token provided", false, 400);
    }
    const user = await verifyToken(token);
    if (!user) {
      return sendResponse(res, "Invalid or expired token", false, 401);
    }

    // Ensure the email is valid before updating
    if (!email) {
      return sendResponse(res, "Email is required", false, 400);
    }

    // const existingEmail = await findByEmail({ email });
    // if (existingEmail) {
    //   return sendResponse(res, "This email is already in use", false, 400);
    // }

    const updatedUser = await findRandomUserAndUpdate(user.id, {
      email,
    });

    if (!updatedUser) {
      return sendResponse(res, "Failed to update user email", false, 500);
    }

    const emailPayload = {
      obj: "Account Verification",
      data: updatedUser.image,
      category: "Image",
    };

    // Optionally send an email
    await sendEmail(
      updatedUser.email,
      emailPayload.obj,
      emailPayload.data,
      emailPayload.category
    );

    return sendResponse(res, "Email updated successfully", true, 200);
  } catch (error) {
    // Handle unexpected errors
    console.error(error); // Log error for debugging
    return sendResponse(res, "An unexpected error occurred", false, 500);
  }
};

export { addImage, randomUserCreate, upload, sendEmailRandomUser };
