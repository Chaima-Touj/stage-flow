import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      required: true,
      enum: ["application:new", "application:status", "interview:reminder", "message:new"],
    },
    data: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: "" },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
