import { models, model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin"],
    },
    phone: {
      type: String,
      default: ""
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    bio: {
      type: String,
      default:""
    },
  },
  { timestamps: true },
);

const User = models.User || model("User", UserSchema);
export default User;
