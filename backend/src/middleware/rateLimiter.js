import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many login attempts" },
  keyGenerator: ipKeyGenerator,
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 1 msg/sec
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  message: { error: "Sending messages too fast" },
});
