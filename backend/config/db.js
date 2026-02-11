import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config(); // Load env variables from .env

const prisma = new PrismaClient();

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("PostgreSQL Connected");
    }
     catch (error) {
        console.error("PostgreSQL connection FAILED 💀", error);
        process.exit(1);
    }
};

export { prisma, connectDB };
