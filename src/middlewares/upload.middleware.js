// src/middlewares/upload.middleware.js
import multer from "multer";
import fs from "fs";
import path from "path";

/* ---------------------------------------------
   STORAGE CONFIG
--------------------------------------------- */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // 🔒 AUTH SAFETY
    if (!req.user || !req.user.id) {
      return cb(new Error("Unauthorized upload attempt"));
    }

    const userId = req.user.id;

    // ✅ WINDOWS-SAFE ABSOLUTE PATH
    const dir = path.resolve(
      "uploads/users/profiles",
      userId
    );

    try {
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },

  filename(req, file, cb) {
    // 🔒 DO NOT TRUST ORIGINAL FILENAME
    let ext = ".jpg";

    if (file.mimetype === "image/png") ext = ".png";
    if (file.mimetype === "image/webp") ext = ".webp";
    if (file.mimetype === "image/jpeg") ext = ".jpg";

    cb(null, `avatar${ext}`);
  }
});

/* ---------------------------------------------
   FILE FILTER
--------------------------------------------- */
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files allowed"));
  }
  cb(null, true);
}

/* ---------------------------------------------
   EXPORT MULTER INSTANCE
--------------------------------------------- */
export const uploadProfilePhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});
