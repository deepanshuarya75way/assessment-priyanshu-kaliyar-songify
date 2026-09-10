import chatMessageModel from "../models/chatMessageModel.js";

const formatMessage = (message) => ({
  id: message._id.toString(),
  userId: message.userId.toString(),
  userName: message.userName,
  text: message.text,
  createdAt: message.createdAt
});

export const getRecentMessages = async (req, res) => {
  try {
    const limitParam = Number(req.query.limit);
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(100, Math.floor(limitParam))) : 50;
    const messages = await chatMessageModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      messages: messages.reverse().map(formatMessage)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load messages" });
  }
};


