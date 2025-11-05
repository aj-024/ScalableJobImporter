export default function ImportTable({ logs }) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow">
        <p className="text-gray-500 text-center">No import history available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">File Name</th>
            <th className="text-left p-2">Total</th>
            <th className="text-left p-2">New</th>
            <th className="text-left p-2">Updated</th>
            <th className="text-left p-2">Failed</th>
            <th className="text-left p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id} className="border-b hover:bg-gray-50">
              <td className="p-2 text-blue-600 underline truncate max-w-xs">
                {log.sourceFeed?.[0] || "N/A"}
              </td>
              <td className="p-2">{log.totalFetched}</td>
              <td className="p-2 text-green-600">{log.newJobs}</td>
              <td className="p-2 text-blue-600">{log.updatedJobs}</td>
              <td className="p-2 text-red-600">{log.failedJobs}</td>
              <td className="p-2">
                {new Date(log.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
