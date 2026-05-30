import { models, model, Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    recipientEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "WORKSPACE_INVITATION",
        "TASK_ASSIGNED",
        "TASK_COMMENT",
        "WORKSPACE_ROLE_CHANGE",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
    entityId: {
      type: String,
      required: false,
    },
    onModel: {
      type: String,
      required: true,
      enum: ["Workspace", "Task", "Board"],
    },
  },
  { timestamps: true },
);

NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ recipientEmail: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

// In Next.js dev with hot reload, mongoose may keep an old compiled model
// around (including outdated "required" validators). Recreate when present.
if (models.Notification) {
  delete models.Notification;
}

const Notification = model("Notification", NotificationSchema);
export default Notification;
