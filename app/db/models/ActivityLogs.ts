import { models, model, Schema } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: false,
    },
    taskContent: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        "CREATE",
        "UPDATE_CONTENT",
        "MOVE_STATUS",
        "COMPLETE",
        "INCOMPLETE",
        "DELETE",
      ],
    },
    details: {
      fromStatus: { type: String },
      toStatus: { type: String },
      oldContent: { type: String },
      newContent: { type: String },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

ActivityLogSchema.index({ workspaceId: 1, createdAt: -1 });

const ActivityLog =
  models.ActivityLog || model("ActivityLog", ActivityLogSchema);
export default ActivityLog;
