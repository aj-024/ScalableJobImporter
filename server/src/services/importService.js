// server/src/services/importService.js
import axios from "axios";
import { parseStringPromise } from "xml2js";
import { getText, makeHashId } from "../utils/helpers.js";

/**
 * Normalize each feed item into a consistent Job format
 */
export function normalizeItem(item, feedUrl) {
  const title = getText(item.title) || getText(item["job:title"]) || "";
  const link =
    getText(item.link) || (item.enclosure && item.enclosure[0]?.$.url) || "";
  const description =
    getText(item.description) ||
    getText(item.summary) ||
    getText(item["job:description"]) ||
    "";

  const postedDate = new Date(
    getText(item.pubDate) || getText(item.published) || Date.now()
  );

  // try extracting external ID
  let externalId = null;
  if (item.guid) {
    if (typeof item.guid === "object" && "_" in item.guid) {
      externalId = item.guid._;
    } else if (typeof item.guid === "string") {
      externalId = item.guid;
    }
  }
  if (!externalId && item.id) {
    if (typeof item.id === "object" && "_" in item.id) {
      externalId = item.id._;
    } else if (typeof item.id === "string") {
      externalId = item.id;
    }
  }

  const categories = (item.category || item.categories || [])
    .map((c) => (typeof c === "string" ? c : getText(c)))
    .filter(Boolean);

  const company =
    getText(item["job:company"]) ||
    getText(item["company"]) ||
    (item.author && getText(item.author.name)) ||
    "";

  return {
    externalId,
    source: feedUrl,
    title,
    company,
    location: getText(item.location) || getText(item["job:location"]) || "",
    jobType: getText(item["job:jobType"]) || "",
    categories,
    description,
    url: Array.isArray(link) ? link[0] : link,
    postedDate: postedDate ? new Date(postedDate) : undefined,
    raw: item,
  };
}

/**
 * Fetch XML feed and return parsed + normalized jobs
 */
export async function fetchAndNormalizeFeed(feedUrl) {
  const res = await axios.get(feedUrl, { timeout: 20000 });
  const xml = res.data;
  const parsed = await parseStringPromise(xml, {
    explicitArray: false,
    mergeAttrs: true,
  });

  let items = [];
  if (parsed.rss?.channel?.item) {
    const ch = parsed.rss.channel;
    items = Array.isArray(ch.item) ? ch.item : [ch.item];
  } else if (parsed.feed?.entry) {
    items = Array.isArray(parsed.feed.entry)
      ? parsed.feed.entry
      : [parsed.feed.entry];
  } else if (parsed.channel?.item) {
    items = Array.isArray(parsed.channel.item)
      ? parsed.channel.item
      : [parsed.channel.item];
  }

  if (!items.length) {
    console.warn(`⚠️ No items found in feed: ${feedUrl}`);
    return [];
  }

  return items
    .map((it) => normalizeItem(it, feedUrl))
    .filter((job) => job.title && job.url)
    .map((job) => {
      if (!job.externalId || typeof job.externalId !== "string") {
        job.externalId = makeHashId(`${job.url}::${job.title}`);
      }
      return job;
    });
}
