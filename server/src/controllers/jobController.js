import mongoose from "mongoose";

const Job = mongoose.model("Job"); // since models are registered dynamically

// GET /api/jobs → fetch all jobs
export async function getAllJobs(req, res) {
  try {
    const jobs = await Job.find().sort({ postedDate: -1 }).limit(50); // latest 50 jobs
    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
