import express from "express"
import { prisma } from "../config/db.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router();

// Save a new job (requires authentication)
router.post("/save", verifyToken, async (req, res) => {
    try {
        const { title, company, location, salary, description, url } = req.body;

        if (!title || !url) {
            return res.status(400).json({ message: "Title and URL are required" });
        }

        const savedJob = await prisma.job.create({
            data: {
                userId: req.userId,
                title,
                company,
                location,
                salary,
                description,
                url
            }
        });

        res.status(201).json({
            message: "Job saved successfully",
            job: savedJob
        });
    }
    catch (error) {
        console.error("Error saving job:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get all jobs for logged-in user
router.get("/", verifyToken, async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { userId: req.userId },
            orderBy: { savedAt: "desc" }
        });
        res.json({
            message: "Jobs retrieved successfully",
            count: jobs.length,
            jobs
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get jobs by status
router.get("/status/:status", verifyToken, async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { userId: req.userId, status: req.params.status },
            orderBy: { savedAt: "desc" }
        });
        res.json({
            message: `${req.params.status} jobs retrieved successfully`,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get single job by ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const job = await prisma.job.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        
        res.json({
            message: "Job retrieved successfully",
            job
        });
    } catch (error) {
        console.error("Error fetching job:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update job status (saved, applied, rejected, offered)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { status, appliedDate } = req.body;
        
        const job = await prisma.job.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const updatedJob = await prisma.job.update({
            where: { id: job.id },
            data: {
                status: status || job.status,
                appliedDate: appliedDate ? new Date(appliedDate) : job.appliedDate
            }
        });

        res.json({
            message: "Job updated successfully",
            job: updatedJob
        });
    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Delete a job
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const job = await prisma.job.findFirst({
            where: { id: req.params.id, userId: req.userId }
        });
        
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        await prisma.job.delete({ where: { id: job.id } });

        res.json({
            message: "Job deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
