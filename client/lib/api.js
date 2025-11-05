const BASE_URL = "http://localhost:4000/api";

export async function fetchImportLogs() {
  const res = await fetch(`${BASE_URL}/logs`);
  if (!res.ok) throw new Error("Failed to fetch logs");
  const json = await res.json();
  return json.data || []; // ✅ safely return array
}

export async function triggerImport() {
  const res = await fetch(`${BASE_URL}/import`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to trigger import");
  return res.json();
}
