import express from "express";
import { prisma } from "../config/db.js";

const router = express.Router();

router.post("/messages", async (req, res) => {
  try {
    const { name, email, topic, message, source, userId } = req.body || {};

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return res.status(400).json({ message: "Message must be at least 5 characters." });
    }

    const saved = await prisma.supportMessage.create({
      data: {
        name: typeof name === "string" ? name.trim() : null,
        email: typeof email === "string" ? email.trim() : null,
        topic: typeof topic === "string" ? topic.trim() : null,
        message: message.trim(),
        source: typeof source === "string" && source.trim() ? source.trim() : "support",
        userId: typeof userId === "string" ? userId.trim() : null,
      }
    });

    res.status(201).json({ message: "Message received", id: saved.id });
  } catch (error) {
    console.error("Error saving support message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
