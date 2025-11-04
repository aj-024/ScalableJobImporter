// server/src/queues/queue.js
import * as bullmq from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const { Queue } = bullmq;

// Some versions of bullmq export QueueScheduler differently
const QueueScheduler =
  bullmq.QueueScheduler ||
  bullmq.default?.QueueScheduler ||
  (await import("bullmq")).QueueScheduler;

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export function createQueue(name = "job_imports") {
  try {
    // Use try–catch to prevent fatal crash if QueueScheduler is missing
    if (QueueScheduler) new QueueScheduler(name, { connection });
    else console.warn("⚠️ QueueScheduler not available in this BullMQ build");
  } catch (err) {
    console.warn("⚠️ Failed to initialize QueueScheduler:", err.message);
  }

  return new Queue(name, {
    connection,
    defaultJobOptions: {
      removeOnComplete: 1000,
      removeOnFail: 10000,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    },
  });
}

export { connection };
