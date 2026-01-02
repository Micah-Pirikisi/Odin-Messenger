import prisma from "../config/db.js";

// -------------------- SEND MESSAGE --------------------
export async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.sub, // from authJwt middleware
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
