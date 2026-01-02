import verifyAccessToken from "../config/jwt";

export default function authJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    req.cookies?.accessToken ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
  };

  next();
};
