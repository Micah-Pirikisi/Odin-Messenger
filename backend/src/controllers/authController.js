import prisma from "../config/db.js";
import {
  createUser,
  findUserByEmail,
  verifyPassword,
} from "../services/userService.js";
import {
  signAccessToken,
  createRefreshTokenString,
  refreshExpiresAt,
} from "../config/jwt.js";
import { isEmail, isStrongPassword } from "../utils/validator.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  domain: process.env.COOKIE_DOMAIN || undefined,
  path: "/",
};

// -------------------- REGISTER --------------------
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (!isEmail(email))
      return res.status(400).json({ error: "Invalid email" });
    if (!isStrongPassword(password))
      return res.status(400).json({ error: "Password too weak (min 8 chars)" });

    // Check if user exists
    const existing = await findUserByEmail(email);
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    // Create user
    const user = await createUser({ email, password, name });

    // Return safe user info
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    next(err);
  }
}

// -------------------- LOGIN --------------------
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    // Optional: validate email format for better UX
    if (!isEmail(email))
      return res.status(400).json({ error: "Invalid email" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await verifyPassword(user, password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // Generate tokens
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = createRefreshTokenString();
    const expiresAt = refreshExpiresAt();

    // Store refresh token in DB
    await prisma.session.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    next(err);
  }
}

// -------------------- REFRESH --------------------
export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ error: "No refresh token" });

    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session)
      return res.status(401).json({ error: "Invalid refresh token" });

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      return res.status(401).json({ error: "Refresh token expired" });
    }

    // Rotate refresh token
    const newRefreshToken = createRefreshTokenString();
    const newExpiresAt = refreshExpiresAt();

    await prisma.session.update({
      where: { id: session.id },
      data: { token: newRefreshToken, expiresAt: newExpiresAt },
    });

    const accessToken = signAccessToken({
      sub: session.user.id,
      email: session.user.email,
    });

    // Set new cookies
    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.json({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
    });
  } catch (err) {
    next(err);
  }
}

// -------------------- LOGOUT --------------------
export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { token: refreshToken } });
    }

    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
