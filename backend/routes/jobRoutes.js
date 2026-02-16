import express from "express"
import { prisma } from "../config/db.js"
import { verifyToken } from "../middleware/auth.js"
import { extractJobDetails, cleanDescriptionText } from "../utils/extractJobDetails.js"

const router = express.Router();

// Helper function to sanitize extracted data
const sanitizeJobData = (data) => {
  const sanitize = (value) => {
    // Ensure it's a string, not an object
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    // If it's an object or anything else, return empty string
    return '';
  };

  return {
    title: sanitize(data.title),
    company: sanitize(data.company),
    location: sanitize(data.location),
    salary: sanitize(data.salary),
  };
};

// Save a new job (requires authentication)
router.post("/save", verifyToken, async (req, res) => {
    const saveStartTime = Date.now();
    console.log("\n📌 JOB SAVE REQUEST START at", new Date().toISOString());
    try {
        let { title, company, location, salary, description, url, salaryRange, employmentType, status } = req.body;
        console.log("📥 Received data:", { title, company, location, salary, url });

        if (!title && !description) {
            return res.status(400).json({ message: "At least title or description is required" });
        }

        if (!url) {
            return res.status(400).json({ message: "URL is required" });
        }

        // Sanitize incoming data and use it as primary source
        let cleanData = sanitizeJobData({
            title,
            company,
            location,
            salary: salary || salaryRange,
        });
        console.log("🧹 Sanitized incoming data:", cleanData);

        // Extract from description as fallback and improvements
        if (description) {
            console.log("🔍 Starting extraction from description...");
            const extracted = await extractJobDetails(description, cleanData);
            console.log("✅ Extraction complete, result:", extracted);
            
            // Sanitize extracted data
            const sanitizedExtracted = sanitizeJobData(extracted);

            cleanData = {
                title: sanitizedExtracted.title || cleanData.title,
                company: sanitizedExtracted.company || cleanData.company,
                location: sanitizedExtracted.location || cleanData.location,
                salary: sanitizedExtracted.salary || cleanData.salary,
            };
        }

        // Final fallbacks with defaults
        const finalData = {
            title: cleanData.title || "Job Title",
            company: cleanData.company || "Unknown Company",
            location: cleanData.location || "Not specified",
            salary: cleanData.salary || "Not disclosed",
        };

        console.log("✓ Final job data to save:", finalData);
        
        const now = new Date();
        console.log("💾 Saving job to database at", now.toISOString());

        const cleanedDescription = cleanDescriptionText(description || "");

        const savedJob = await prisma.job.create({
            data: {
                userId: req.userId,
                title: finalData.title,
                company: finalData.company,
                location: finalData.location,
                salary: finalData.salary,
                description: cleanedDescription,
                url,
                status: status || "saved",
                appliedDate: new Date()
            }
        });

        const saveEndTime = Date.now();
        console.log("✅ Job saved successfully in", saveEndTime - saveStartTime, "ms");
        console.log("💾 Saved job ID:", savedJob.id);
        console.log("📌 JOB SAVE REQUEST END at", new Date().toISOString(), "\n");

        res.status(201).json({
            message: "Job saved successfully",
            job: savedJob
        });
    }
    catch (error) {
        const errorTime = Date.now();
        console.error("❌ Error saving job:", error.message);
        console.error("Full error:", error);
        console.error("📌 JOB SAVE REQUEST FAILED after", errorTime - saveStartTime, "ms at", new Date().toISOString(), "\n");
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
        const cleanedJobs = await Promise.all(
            jobs.map(async (job) => {
                const cleanedDescription = cleanDescriptionText(job.description || "");
                if (cleanedDescription && cleanedDescription !== job.description) {
                    return prisma.job.update({
                        where: { id: job.id },
                        data: { description: cleanedDescription }
                    });
                }
                return job;
            })
        );
        res.json({
            message: "Jobs retrieved successfully",
            count: cleanedJobs.length,
            jobs: cleanedJobs
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
        const cleanedJobs = await Promise.all(
            jobs.map(async (job) => {
                const cleanedDescription = cleanDescriptionText(job.description || "");
                if (cleanedDescription && cleanedDescription !== job.description) {
                    return prisma.job.update({
                        where: { id: job.id },
                        data: { description: cleanedDescription }
                    });
                }
                return job;
            })
        );
        res.json({
            message: `${req.params.status} jobs retrieved successfully`,
            count: cleanedJobs.length,
            jobs: cleanedJobs
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Clear activity history (delete all jobs for user)
router.delete("/history", verifyToken, async (req, res) => {
    try {
        await prisma.job.deleteMany({ where: { userId: req.userId } });
        res.json({ message: "Activity history cleared" });
    } catch (error) {
        console.error("Error clearing activity history:", error);
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

        const cleanedDescription = cleanDescriptionText(job.description || "");
        const updatedJob = (cleanedDescription && cleanedDescription !== job.description)
            ? await prisma.job.update({
                where: { id: job.id },
                data: { description: cleanedDescription }
            })
            : job;
        
        res.json({
            message: "Job retrieved successfully",
            job: updatedJob
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
