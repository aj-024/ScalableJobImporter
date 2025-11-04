// server/src/workers/worker.js
import pkg from "bullmq";
const { Worker } = pkg;
import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

import JobModel from "../models/Job.js";
import ImportLogModel from "../models/ImportLog.js";

const QUEUE_NAME = "job_imports";
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || "5", 10);

// ✅ Redis connection with BullMQ-safe options
const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Quick connection log
redisConnection.on("connect", () => console.log("✅ Redis connected (Worker)"));
redisConnection.on("error", (err) => console.error("❌ Redis connection error:", err.message));

async function upsertJob(jobData) {
  const { job } = jobData;
  const filter = {};

  if (job.externalId) filter.externalId = job.externalId;
  if (job.source) filter.source = job.source;
  if (!filter.externalId && job.url) filter.url = job.url; // fallback uniqueness

  const update = {
    $set: {
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      categories: job.categories || [],
      description: job.description,
      url: job.url,
      postedDate: job.postedDate ? new Date(job.postedDate) : undefined,
      raw: job.raw,
      lastImportedAt: new Date(),
    },
    $setOnInsert: {
      externalId: job.externalId,
      source: job.source,
      createdAt: new Date(),
    },
  };

  return JobModel.findOneAndUpdate(filter, update, { upsert: true, new: true });
}

export function startWorker() {
  const worker = new Worker(
    QUEUE_NAME,
    async (bullJob) => {
      const { job, runId } = bullJob.data;
      try {
        const before = await JobModel.findOne({
          externalId: job.externalId,
          source: job.source,
        });

        const result = await upsertJob({ job });
        const isNew = !before;

        if (runId) {
          await ImportLogModel.findOneAndUpdate(
            { runId },
            {
              $inc: {
                totalProcessed: 1,
                ...(isNew ? { newJobs: 1 } : { updatedJobs: 1 }),
              },
            }
          );
        }

        return { ok: true, new: isNew };
      } catch (err) {
        console.error("❌ Worker job failed:", err.message);
        if (runId) {
          await ImportLogModel.findOneAndUpdate(
            { runId },
            {
              $inc: { failedJobs: 1 },
              $push: {
                failures: {
                  externalId: job.externalId,
                  reason: err.message,
                  payloadSnippet: { title: job.title, url: job.url },
                },
              },
            }
          );
        }
        throw err; // trigger retry/backoff
      }
    },
    {
      connection: redisConnection,
      concurrency: CONCURRENCY,
    }
  );

  worker.on("completed", (job) =>
    console.log(`🎯 Job ${job.id} completed successfully.`)
  );
  worker.on("failed", (job, err) =>
    console.error(`💥 Job ${job?.id} failed:`, err?.message)
  );
  worker.on("error", (err) => console.error("Worker error:", err));

  console.log(`✅ Worker started (queue=${QUEUE_NAME}, concurrency=${CONCURRENCY})`);
  return worker;
}
