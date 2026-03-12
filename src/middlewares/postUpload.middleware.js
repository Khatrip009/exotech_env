import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.resolve("uploads/posts", req.user.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

export const uploadPostMedia = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
