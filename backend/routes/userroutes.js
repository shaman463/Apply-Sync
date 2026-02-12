import express from "express";
import { registerUser, loginUser, googleLogin } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

export default router;
