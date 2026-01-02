import { verifyAccessToken } from "../config/jwt.js";

export default function authJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    req.cookies?.accessToken ||
    (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

  if (!token) {
    const err = new Error("Unauthorized");
    err.status = 401;
    return next(err);
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    const err = new Error("Invalid or expired token");
    err.status = 401;
    return next(err);
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
  };

  next();
}
