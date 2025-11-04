// server/src/routes/importRoutes.js
import express from "express";
import { triggerImport, getImportLogs } from "../controllers/importController.js";

const router = express.Router();

/**
 * @route POST /api/import
 * @desc Trigger manual import of job feeds
 */
router.post("/import", triggerImport);

/**
 * @route GET /api/logs
 * @desc Get recent import logs
 */
router.get("/logs", getImportLogs);

export default router;
