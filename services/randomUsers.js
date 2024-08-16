import mongoose from "mongoose";
import { randomUsers } from "../models/randomUsers.js";

const randomUsersCreate = async (payload) => {
  try {
    // Ensure payload matches schema
    const user = await randomUsers.create(payload);
    return user;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

const findRandomUserAndUpdate = async (userID, payload) => {
  try {
    const user = await randomUsers.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userID), // Pass the userID directly
      payload,
      { new: true }
    );

    return user;
  } catch (error) {
    console.log("error", error);
    console.error(`Error updating user: ${error.message}`);
    throw new Error(`Error updating user: ${error.message}`);
  }
};

const findByEmail = async (payload) => {
  try {
    const user = await randomUsers.findOne(payload);
    return user;
  } catch (error) {
    console.log("Error:", error);
    console.error(`Error finding user by email: ${error.message}`);
    throw new Error(`Error finding user by email: ${error.message}`);
  }
};

export { randomUsersCreate, findRandomUserAndUpdate, findByEmail };
