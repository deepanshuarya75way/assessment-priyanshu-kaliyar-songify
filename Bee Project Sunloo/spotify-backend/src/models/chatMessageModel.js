import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 }
}, { timestamps: true });

const chatMessageModel = mongoose.models.chatMessage || mongoose.model("chatMessage", chatMessageSchema);

export default chatMessageModel;


