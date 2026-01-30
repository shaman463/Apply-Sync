import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/userroutes.js";
import jobRoutes from "./routes/jobRoutes.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

connectDB(); // <--- connect to DB

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
