const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_DAYS = parseInt(
  process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || "30",
  10
);

if (!SECRET) {
  throw new Error("JWT_SECRET is not set");
}

function signAccessToken(payload) {
  return jwt.sign({ sub: user.id, email: user.email }, SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

function createRefreshTokenString() {
  // use random bytes for refresh token string
  return require("crypto").randomBytes(64).toString("hex");
}

function refreshExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_EXPIRES_DAYS);
  return d;
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  createRefreshTokenString,
  refreshExpiresAt,
};
