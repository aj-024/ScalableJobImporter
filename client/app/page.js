"use client";
import { useEffect, useState } from "react";
import ImportTable from "@/components/ImportTable";
import { fetchImportLogs, triggerImport } from "@/lib/api";
import toast from "react-hot-toast";

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  async function loadLogs() {
    try {
      setLoading(true);
      const data = await fetchImportLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    try {
      setImporting(true);
      await triggerImport();
      toast.success("Import triggered successfully!");
      await loadLogs(); // refresh table
    } catch (err) {
      console.error(err);
      toast.error("Failed to trigger import.");
    } finally {
      setImporting(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Import History Dashboard</h1>
        <button
          onClick={handleImport}
          disabled={importing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {importing ? "Importing..." : "Run Import Now"}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <ImportTable logs={logs} />
      )}
    </main>
  );
}
