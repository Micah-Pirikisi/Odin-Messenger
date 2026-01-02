import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      const err = new Error("Only image uploads allowed");
      err.status = 400;
      return cb(err, false);
    }
    cb(null, true);
  },
});

export default upload;
