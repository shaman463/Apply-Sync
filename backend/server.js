import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/userroutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

connectDB(); // <--- connect to DB

app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
