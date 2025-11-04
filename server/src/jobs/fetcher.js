// server/src/jobs/fetcher.js
import { v4 as uuidv4 } from "uuid";
import { createQueue } from "../queues/queue.js";
import ImportLogModel from "../models/ImportLog.js";
import { fetchAndNormalizeFeed } from "../services/importService.js";

const queue = createQueue("job_imports");

/**
 * Fetches a feed, normalizes items, and enqueues them
 */
export async function fetchFeedAndEnqueue(feedUrl, runId, batchSize = 50) {
  try {
    const jobs = await fetchAndNormalizeFeed(feedUrl);
    if (!jobs.length) return { enqueued: 0, fetched: 0 };

    let enqueued = 0;

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      await Promise.all(
        batch.map((job) =>
          queue.add("import-job", { job, runId }, { removeOnComplete: 1000 })
        )
      );
      enqueued += batch.length;
    }

    console.log(`✅ Enqueued ${enqueued}/${jobs.length} jobs from ${feedUrl}`);
    return { enqueued, fetched: jobs.length };
  } catch (err) {
    console.error(`❌ fetchFeedAndEnqueue error for ${feedUrl}:`, err.message);
    throw err;
  }
}

/**
 * Main importer to run for all feeds and track logs
 */
export async function runImporter(feeds = [], options = {}) {
  const feedList = feeds.length
    ? feeds
    : (process.env.FEEDS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const runId = uuidv4();
  const batchSize =
    options.batchSize || parseInt(process.env.BATCH_SIZE || "50", 10);

  await ImportLogModel.create({
    runId,
    sourceFeed: feedList,
    totalFetched: 0,
    totalQueued: 0,
    totalProcessed: 0,
    newJobs: 0,
    updatedJobs: 0,
    failedJobs: 0,
    failures: [],
    meta: { batchSize },
  });

  let totalFetched = 0;
  let totalQueued = 0;

  for (const feed of feedList) {
    try {
      const { enqueued, fetched } = await fetchFeedAndEnqueue(
        feed,
        runId,
        batchSize
      );
      totalFetched += fetched;
      totalQueued += enqueued;

      await ImportLogModel.findOneAndUpdate(
        { runId },
        { $inc: { totalFetched: fetched, totalQueued: enqueued } }
      );
    } catch (err) {
      await ImportLogModel.findOneAndUpdate(
        { runId },
        {
          $push: {
            failures: {
              reason: `fetch_error: ${err.message}`,
              payloadSnippet: { feed },
            },
          },
          $inc: { failedJobs: 1 },
        }
      );
    }
  }

  await ImportLogModel.findOneAndUpdate(
    { runId },
    { $set: { totalFetched, totalQueued } }
  );

  console.log(`📦 Import run complete: fetched=${totalFetched}, queued=${totalQueued}`);
  return { runId, totalFetched, totalQueued };
}
