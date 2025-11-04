// server/src/models/Job.js
import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

const JobSchema = new Schema(
  {
    externalId: {
      type: String,
      index: true,
      set: (v) => (v ? String(v) : v), // ensure always string
    },
    source: { type: String, required: true }, // feed URL or name
    title: { type: String, required: true },
    company: { type: String },
    location: { type: String },
    jobType: { type: String }, // full-time, part-time, contract, remote
    categories: [{ type: String }],
    description: { type: String },
    url: { type: String },
    postedDate: { type: Date },
    raw: { type: Schema.Types.Mixed }, // raw feed data for debugging
    lastImportedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🩹 Auto-generate fallback externalId if missing (safety net)
JobSchema.pre("validate", function (next) {
  if (!this.externalId && this.url && this.title) {
    const str = `${this.url}::${this.title}`;
    this.externalId = crypto.createHash("sha256").update(str).digest("hex");
  }
  next();
});

// ✅ Unique indexes for safety and performance
JobSchema.index(
  { externalId: 1, source: 1, url: 1 },
  { unique: true, sparse: true }
);
JobSchema.index({ url: 1 }, { unique: true, sparse: true });
JobSchema.index({ title: "text", description: "text" });

export default mongoose.models.Job || mongoose.model("Job", JobSchema);
