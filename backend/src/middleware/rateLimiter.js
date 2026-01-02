import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many login attempts" },
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 1 msg/sec
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  message: { error: "Sending messages too fast" },
});
