import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { registerUser, loginUser, googleLogin, verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

router.put("/password", verifyToken, async (req, res) => {
	try {
		const { currentPassword, newPassword, confirmPassword } = req.body;

		if (!currentPassword || !newPassword || !confirmPassword) {
			return res.status(400).json({ message: "All password fields are required" });
		}

		if (newPassword !== confirmPassword) {
			return res.status(400).json({ message: "New passwords do not match" });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters" });
		}

		const user = await prisma.user.findUnique({ where: { id: req.userId } });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Current password is incorrect" });
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: user.id },
			data: { password: hashedPassword }
		});

		res.json({ message: "Password updated successfully" });
	} catch (error) {
		console.error("Error updating password:", error);
		res.status(500).json({ message: "Server error" });
	}
});

router.delete("/me", verifyToken, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({ where: { id: req.userId } });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		await prisma.$transaction([
			prisma.job.deleteMany({ where: { userId: req.userId } }),
			prisma.user.delete({ where: { id: req.userId } })
		]);

		res.json({ message: "Account deleted successfully" });
	} catch (error) {
		console.error("Error deleting account:", error);
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
