import express from "express";
import { getRecentMessages } from "../controllers/chatController.js";
import { authenticate } from "../middleware/auth.js";

const chatRouter = express.Router();

chatRouter.get("/recent", authenticate, getRecentMessages);

export default chatRouter;


