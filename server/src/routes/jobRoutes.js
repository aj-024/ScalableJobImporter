import express from "express";
import { getAllJobs } from "../controllers/jobController.js";

const router = express.Router();

// GET /api/jobs
router.get("/jobs", getAllJobs);

export default router;
