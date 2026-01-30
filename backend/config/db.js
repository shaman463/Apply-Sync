import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // This is used to load the env variables inside this from .env file

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection FAILED 💀", error);
        process.exit(1); // Stop the server if the server is not responding or working
    }
};

export default connectDB;
