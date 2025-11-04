import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check route
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", message: "Server is running 🚀" })
);

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  // ✅ Connect MongoDB
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // ✅ Register models dynamically
  await import("./src/models/index.js");
  console.log("Registered models:", mongoose.modelNames());

  // ✅ Start the background worker
  const { startWorker } = await import("./src/workers/worker.js");
  startWorker();

  // ✅ Import the queue-based fetcher for scheduled imports
  const { runImporter } = await import("./src/jobs/fetcher.js");

  // ✅ Mount centralized routes
  const { default: importRoutes } = await import("./src/routes/importRoutes.js");
  const { default: jobRoutes } = await import("./src/routes/jobRoutes.js"); // 👈 added

  app.use("/api", importRoutes);
  app.use("/api", jobRoutes); // 👈 added

  // ✅ Schedule automatic hourly job imports
  const cronExpression = process.env.IMPORT_CRON || "0 * * * *"; // every hour
  cron.schedule(cronExpression, async () => {
    console.log("⏱️ Running scheduled importer:", new Date().toISOString());
    try {
      await runImporter([]);
      console.log("✅ Scheduled import finished");
    } catch (err) {
      console.error("❌ Scheduled import error:", err.message);
    }
  });

  // ✅ Start the server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Bootstrap the app
bootstrap().catch((err) => {
  console.error("❌ Bootstrap error:", err);
});
