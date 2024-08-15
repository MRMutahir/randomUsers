// controllers/randomUsers.js
import path from "path";
import fs from "fs";
import multer from "multer";
import { sendResponse } from "../helpers/common.js";
import {
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
    const { username } = req.body;

    // Generate a unique name
    // const uniqueName = await generateUniqueName(username);

    const newUser = await randomUsersCreate({
      userName: username,
    });

    const JwtPayload = {
      id: newUser._id.toString(), // Convert ObjectId to string
      userName: newUser.userName,
    };
    const authToken = await signToken(JwtPayload);
    newUser.token = authToken;
    await newUser.save();
    return sendResponse(
      res,
      "Random user created successfully",
      true,
      200,
      newUser
    );
  } catch (error) {
    next(error); // Handle errors appropriately
  }
};

const addImage = async (req, res, next) => {
  try {
    const token = req.params.token;

    if (!token) {
      return sendResponse(res, "No token provided", false, 400);
    }

    const user = await verifyToken(token);
    if (!user) {
      return sendResponse(res, "User not valid", false, 404);
    }

    if (!req.file) {
      return sendResponse(res, "No file uploaded", false, 400);
    }

    const { filename, path: filePath, mimetype } = req.file;

    const updatedUser = await findRandomUserAndUpdate(user.id, {
      image: filePath,
    });

    if (!updatedUser) {
      return sendResponse(res, "Failed to update user image", false, 500);
    }

    return sendResponse(res, "User image added successfully", true, 200, {
      filename,
      filePath,
      mimetype,
    });
  } catch (error) {
    console.error(`Error in addImage: ${error.message}`);
    next(error);
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
      return sendResponse(res, "User not valid", false, 404);
    }
    const updatedUser = await findRandomUserAndUpdate(user.id, {
      email,
    });
    if (!updatedUser) {
      return sendResponse(res, "User email is not add", false, 500);
    }
    const emailPayload = {
      obj: "Account Verification",
      data: updatedUser.image,
      category: "Image",
    };
    
    await sendEmail(
      updatedUser.email,
      emailPayload.obj,
      emailPayload.data,
      emailPayload.category
    );

    return sendResponse(res, "send email successfully", true, 200);
  } catch (error) {
    console.error(`Error in addImage: ${error.message}`);
    next(error);
  }
};

export { addImage, randomUserCreate, upload, sendEmailRandomUser };
