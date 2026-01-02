import express from "express";
import { sendMessage, getMessages } from "../controllers/userController.js";
import { authJwt } from "../middleware/authJwt.js";
import { messageLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All message routes require auth
router.use(authJwt);

// Send message, rate-limited
router.post("/", messageLimiter, sendMessage);

// Get latest messages, no rate limit (read-only)
router.get("/", getMessages);

export default router;
