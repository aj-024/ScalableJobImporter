// server/src/controllers/importController.js
import { runImporter } from "../jobs/fetcher.js";
import ImportLogModel from "../models/ImportLog.js";

/**
 * Trigger a job import manually
 */
export async function triggerImport(req, res) {
  try {
    const { runId, totalFetched, totalQueued } = await runImporter();
    res.status(200).json({
      success: true,
      message: "Import started successfully",
      runId,
      totalFetched,
      totalQueued,
    });
  } catch (err) {
    console.error("❌ Error in triggerImport:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Fetch import history logs
 */
export async function getImportLogs(req, res) {
  try {
    const logs = await ImportLogModel.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    console.error("❌ Error fetching logs:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}
