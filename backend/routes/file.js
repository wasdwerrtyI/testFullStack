import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Получаем текущую директорию для ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Конфигурация загрузки файлов
 * @constant
 * @type {multer.StorageEngine}
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");

    // Создаем директорию, если не существует
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

/**
 * Middleware для загрузки файлов
 * @constant
 * @type {multer.Instance}
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

const router = express.Router();

/**
 * Загрузка файла
 * @route POST /api/files/upload
 * @consumes multipart/form-data
 * @param {file} file - Загружаемый файл
 * @returns {object} 200 - URL загруженного файла
 * @returns {object} 400 - Ошибка загрузки файла
 * @returns {object} 413 - Файл слишком большой
 * @returns {object} 415 - Неподдерживаемый тип файла
 */
router.post(
  "/upload",
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  },
  (error, req, res, next) => {
    // Обработка ошибок multer
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "File too large" });
      }
      return res.status(400).json({ error: error.message });
    } else if (error) {
      return res.status(415).json({ error: "Unsupported file type" });
    }
    next();
  }
);

export default router;
