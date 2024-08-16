import mongoose from "mongoose";

const RandomUsersSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: false,
      trim: true,
      lowercase: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const randomUsers = mongoose.model("RandomUsers", RandomUsersSchema);

export { randomUsers };
