// server/src/models/ImportLog.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const FailureSchema = new Schema(
  {
    externalId: { type: String },
    reason: { type: String, required: true },
    payloadSnippet: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ImportLogSchema = new Schema(
  {
    runId: { type: String, required: true, index: true }, // uuid for the run
    timestamp: { type: Date, default: Date.now, index: true },
    sourceFeed: { type: [String], default: [] }, // array of feeds used in this run
    totalFetched: { type: Number, default: 0 },
    totalQueued: { type: Number, default: 0 },
    totalProcessed: { type: Number, default: 0 },
    newJobs: { type: Number, default: 0 },
    updatedJobs: { type: Number, default: 0 },
    failedJobs: { type: Number, default: 0 },
    failures: { type: [FailureSchema], default: [] },
    durationMs: { type: Number, default: 0 },
    meta: { type: Schema.Types.Mixed, default: {} }, // e.g. concurrency, batchSize
  },
  {
    timestamps: true,
  }
);

// Indexes for quick queries (recent first)
ImportLogSchema.index({ timestamp: -1 });

export default mongoose.models.ImportLog || mongoose.model("ImportLog", ImportLogSchema);
