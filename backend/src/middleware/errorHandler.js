import { Prisma } from "@prisma/client";

export default function errorHandler(err, req, res, next) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Resource already exists",
      });
    }
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File too large (max 2MB)",
      });
    }
  }

  const status = err.status || 500;

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({
    error:
      status === 500
        ? "Internal server error"
        : err.message || "Request failed",
  });
}
