import prisma from "../config/db.js";
import { findUserById, setAvatarUrl } from "../services/userService.js";
import fs from "fs/promises";
import path from "path";

// -------------------- SEND MESSAGE --------------------
export async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        conversationId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      sender: message.sender,
    });
  } catch (err) {
    next(err);
  }
}

// -------------------- GET MESSAGES --------------------
export async function getMessages(req, res, next) {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(messages.reverse()); // send oldest to newest
  } catch (err) {
    next(err);
  }
}

// -------------------- GET PROFILE --------------------
export async function getProfile(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// -------------------- UPLOAD AVATAR --------------------
export async function uploadAvatar(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const ext = (file.mimetype || "image").split("/").pop();
    const filename = `${userId}-${Date.now()}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "backend", "public", "uploads");

    // ensure directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    const dest = path.join(uploadsDir, filename);
    await fs.writeFile(dest, file.buffer);

    const avatarUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/${filename}`;

    await setAvatarUrl(userId, avatarUrl);

    res.json({ avatarUrl });
  } catch (err) {
    next(err);
  }
}

// -------------------- UPDATE STATUS --------------------
export async function updateStatus(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { status } = req.body;
    if (!status || typeof status !== "string" || status.trim() === "") {
      return res.status(400).json({ error: "Status cannot be empty" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: status.trim() },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        status: true,
      },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// -------------------- SEARCH USERS --------------------
export async function searchUsers(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const q = (req.query.q || "").trim();
    console.log(`[SEARCH] userId=${userId}, query="${q}"`);

    if (!q || q.length < 1) {
      console.log("[SEARCH] Query empty, returning empty results");
      return res.json([]);
    }

    // Use a simpler approach: search by email or name with proper null handling
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId }, // exclude self
        OR: [
          // Search by email (always exists)
          { email: { contains: q, mode: "insensitive" } },
          // Search by name if it exists (null-safe)
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        status: true,
      },
      take: 10,
    });

    console.log(`[SEARCH] Found ${users.length} users for query "${q}"`);
    users.forEach((u) => console.log(`  - ${u.name || u.email}`));

    res.json(users);
  } catch (err) {
    console.error("[SEARCH] Error:", err);
    next(err);
  }
}

// -------------------- GET CONVERSATIONS --------------------
export async function getConversations(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                status: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        messages: {
          _count: "desc",
        },
      },
    });

    res.json(conversations);
  } catch (err) {
    next(err);
  }
}

// -------------------- CREATE CONVERSATION --------------------
export async function createConversation(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { participantId } = req.body;
    if (!participantId || typeof participantId !== "number") {
      return res.status(400).json({ error: "Invalid participant ID" });
    }

    if (participantId === userId) {
      return res.status(400).json({ error: "Cannot chat with yourself" });
    }

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
    });

    if (existing) {
      return res.json(existing);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          createMany: {
            data: [{ userId }, { userId: participantId }],
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                status: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    res.status(201).json(conversation);
  } catch (err) {
    next(err);
  }
}
