import express from "express";
import {
  sendMessage,
  getMessages,
  getProfile,
  uploadAvatar,
  updateStatus,
  searchUsers,
  getConversations,
  createConversation,
} from "../controllers/userController.js";
import authJwt from "../middleware/authJwt.js";
import { messageLimiter } from "../middleware/rateLimiter.js";
import uploader from "../uploads/multer.js";

const router = express.Router();

// All user routes require auth
router.use(authJwt);

// Profile routes
router.get("/me", getProfile);
router.post("/me/avatar", uploader.single("avatar"), uploadAvatar);
router.put("/me/status", updateStatus);

// Search and conversation routes
router.get("/search", searchUsers);
router.get("/conversations", getConversations);
router.post("/conversations", createConversation);

export default router;
