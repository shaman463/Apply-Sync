import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads", "resumes");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const originalExt = path.extname(file.originalname) || ".pdf";
    const safeExt = originalExt.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".docx"];
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Unsupported file type. Use PDF or DOCX."));
    }
    cb(null, true);
  }
});

router.post("/score", upload.single("resume"), async (req, res, next) => {
  const pythonBin = process.env.PYTHON_BIN || "python";
  const scriptPath = path.resolve(__dirname, "..", "..", "Model", "model.py");

  if (!req.file) {
    return res.status(400).json({ message: "Resume file is required." });
  }

  const filePath = req.file.path;
  const child = spawn(pythonBin, [scriptPath, filePath], {
    env: process.env
  });

  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  child.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  child.on("error", (error) => {
    fs.promises.unlink(filePath).catch(() => undefined);
    return res.status(500).json({
      message: "Failed to start resume scoring.",
      error: error.message
    });
  });

  child.on("close", async (code) => {
    try {
      if (stderr) {
        console.error("Resume scoring stderr:", stderr);
      }
      if (code !== 0) {
        return res.status(500).json({
          message: "Resume scoring failed.",
          error: stderr || "Model process exited with an error."
        });
      }

      const result = JSON.parse(stdout.trim());
      return res.json({ score: result });
    } catch (error) {
      return res.status(500).json({
        message: "Unable to parse resume score.",
        error: stderr || error.message
      });
    } finally {
      fs.promises.unlink(filePath).catch(() => undefined);
    }
  });
});

export default router;
