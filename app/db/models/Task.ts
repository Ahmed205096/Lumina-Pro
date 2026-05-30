import { models, model, Schema } from "mongoose";

const TaskSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Task content is required"],
      trim: true,
    },
    periority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      required: true,
      enum: ["todo", "inProgress", "done"],
      default: "todo",
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace ID is required"],
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,

    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

TaskSchema.index({ workspaceId: 1, status: 1, order: 1 });

const Task = models.Task || model("Task", TaskSchema);
export default Task;
