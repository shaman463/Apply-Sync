import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '../config/db.js'
import jwt from 'jsonwebtoken' // jwt is used for generating login tokens

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(googleClientId);

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(401).json({ message: "User not found. Please log in again." });
        }

        req.userId = user.id;
        next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const loginUser = async (req, res) => {
    try {
        // whenever there is a post request is made from frontend
        // it sends it's data in req body so to catch it we write this small const user
        const { email, password } = req.body;

        // Search for the email
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // token is used here to tell or what proves that user is logged in
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "30D" }
        );

        // sending reponse to the frontend if everything is correct
        res.json({
            message: "Login successful",
            token,
            user: {
                FirstName: user.FirstName,
                LastName: user.LastName,
                email: user.email,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// to register an fucking user
export const registerUser = async (req, res) => {
    try {
        const { FirstName, LastName, email, password } = req.body;

        // Making sure all the field are filled in
        if (!FirstName || !LastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // if user already exists then show a message 
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // make a user if everything is going great
        const user = await prisma.user.create({
            data: {
                FirstName: FirstName,
                LastName: LastName,
                email,
                password: hashedPassword
            }
        });

        // create a jwt token or user creation 
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "30D" }
        );

        // show that user has been created
        res.status(201).json({
            message: "User Created Successfully",
            token,
            user: {
                FirstName: user.FirstName,
                LastName: user.LastName,
                email: user.email,
            },
        });
    }
    // catching some error if some idiot is trying something different
     catch (error) {
        console.error(error);

        if (error.code === "P2002") {
            return res.status(400).json({ message: "Email already exists" });
        }

        res.status(500).json({ message: "Server error", details: error.message });
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Missing Google credential" });
        }

        if (!googleClientId) {
            return res.status(500).json({ message: "Google client ID not configured" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: googleClientId
        });

        const payload = ticket.getPayload();
        const email = payload?.email;

        if (!email) {
            return res.status(400).json({ message: "Google account email not available" });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const FirstName = payload?.given_name || payload?.name?.split(" ")[0] || "Google";
            const LastName = payload?.family_name || payload?.name?.split(" ").slice(1).join(" ") || "User";

            user = await prisma.user.create({
                data: {
                    FirstName,
                    LastName,
                    email,
                    password: hashedPassword
                }
            });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "30D" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                FirstName: user.FirstName,
                LastName: user.LastName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

