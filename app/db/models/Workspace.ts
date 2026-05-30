import { models, model, Schema } from "mongoose";

const WorkspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          required: true,
          default: "member",
          enum: ["admin", "member", "viewer"],
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    invitedEmails: [
      {
        email: { type: String, required: true },
        role: {
          type: String,
          default: "member",
          enum: ["admin", "member", "viewer"],
        },
        invitedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

WorkspaceSchema.index({ slug: 1 });
WorkspaceSchema.index({ "members.userId": 1 });

const Workspace = models.Workspace || model("Workspace", WorkspaceSchema);
export default Workspace;
