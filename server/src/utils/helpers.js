// server/src/utils/helpers.js
import crypto from "crypto";

// safely extract text value from xml2js node
export const getText = (v) => {
  if (!v) return undefined;
  if (typeof v === "object" && "_" in v) return v._;
  if (Array.isArray(v)) return v[0];
  return v;
};

// fallback hash generator for unique IDs
export const makeHashId = (str) =>
  crypto.createHash("sha256").update(str).digest("hex");
