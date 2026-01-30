import User from '../model/user.js'
import jwt from 'jsonwebtoken' // jwt is used for generating login tokens

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
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
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // token is used here to tell or what proves that user is logged in
        const token = jwt.sign(
            { id: user._id },
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

export const registerUser = async (req, res) => {
    try {
        const { FirstName, LastName, email, password } = req.body;

        if (!FirstName || !LastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            FirstName: FirstName,
            LastName: LastName,
            email,
            password
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30D" }
        );

        res.status(201).json({
            message: "User Created Successfully",
            token,
            user: {
                FirstName: user.FirstName,
                LastName: user.LastName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);

        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0]?.message;
            return res.status(400).json({ message: firstError || "Invalid input" });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue || {})[0] || "field";
            return res.status(400).json({ message: `${field} already exists` });
        }

        res.status(500).json({ message: "Server error", details: error.message });
    }
}

