import { useState, useEffect } from "react";
import api from "../services/api";
import PageLayout from "../components/PageLayout";

import {
  card,
  buttonPrimary,
  buttonDanger,
  buttonSuccess,
  select,
  input,
} from "../styles/ui";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState("7d");
  const [extendValue, setExtendValue] = useState("1d");
  const [toast, setToast] = useState("");
  const [uploading, setUploading] = useState(false);
  const [storage, setStorage] = useState(null);
  const [files, setFiles] = useState([]);
  const [now, setNow] = useState(new Date());

  /* LIVE CLOCK */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* TOAST */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* STORAGE */
  const calculateStorageFromFiles = (files) => {
    const used = files.reduce(
      (sum, f) => sum + Number(f.sizeMB || 0),
      0
    );
    return { usedMB: used.toFixed(2), limitMB: 100 };
  };

  /* FETCH FILES */
  const fetchFiles = async () => {
    try {
      const res = await api.get("/files/my");
      setFiles(res.data);
      setStorage(calculateStorageFromFiles(res.data));
    } catch {
      showToast("❌ Session expired. Please login again.");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  /* COUNTDOWN */
  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - now;
    if (diff <= 0) return "Expired";

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${d}d ${h}h ${m}m ${s}s`;
  };

  /* FILE ICON */
  const fileIcon = (name) => {
    if (name.endsWith(".pdf")) return "📕";
    if (name.endsWith(".txt")) return "📄";
    if (name.match(/\.(png|jpg|jpeg)$/)) return "🖼️";
    return "📦";
  };

  /* ACTIONS */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("expiry", expiry);
      await api.post("/files/upload", fd);

      showToast("✅ File uploaded");
      setFile(null);
      fetchFiles();
    } catch (err) {
      showToast(err.response?.data?.message || "❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (id) => {
    const token = localStorage.getItem("token");
    if (!token) return showToast("❌ Not logged in");

    window.open(
      `http://localhost:5000/api/files/download/${id}?token=${token}`,
      "_blank"
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    await api.delete(`/files/delete/${id}`);
    showToast("🗑️ File deleted");
    fetchFiles();
  };

  const handleExtend = async (id) => {
    await api.patch(`/files/extend/${id}`, {
      extendBy: extendValue,
    });
    showToast("⏳ Expiry extended");
    fetchFiles();
  };

  return (
    <PageLayout
      title="📦 Dashboard"
      subtitle="Secure file storage with automatic expiry"
    >
      {/* STORAGE BAR — UNCHANGED */}
      {storage && (
        <div className={`${card} p-6 mb-10`}>
          <div className="flex justify-between mb-2">
            <p className="font-semibold text-slate-800">Storage Usage</p>
            <span className="text-sm text-slate-500">
              {storage.usedMB} / {storage.limitMB} MB
            </span>
          </div>

          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{
                width: `${(storage.usedMB / storage.limitMB) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* UPLOAD */}
        <div className={`${card} p-6`}>
          <h2 className="font-semibold text-lg mb-4">
            Upload New File
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className={input}
            />

            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className={select}
            >
              <option value="1h">Expire in 1 Hour</option>
              <option value="1d">Expire in 1 Day</option>
              <option value="7d">Expire in 7 Days</option>
            </select>

            <button
              disabled={uploading}
              className={`${buttonPrimary} w-full`}
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </form>
        </div>

        {/* FILES */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-lg mb-4">Your Files</h2>

          {files.length === 0 ? (
            <div className={`${card} p-12 text-center text-slate-500`}>
              <p className="text-5xl mb-3">📭</p>
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {files.map((f) => {
                const expired = new Date(f.expiresAt) <= now;

                return (
                  <div key={f._id} className={`${card} p-6`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {fileIcon(f.originalName)}
                      </span>
                      <p className="font-medium truncate">
                        {f.originalName}
                      </p>
                    </div>

                    <span
                      className={`inline-block mb-4 px-3 py-1 text-xs rounded-full ${
                        expired
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {expired
                        ? "Expired"
                        : getTimeLeft(f.expiresAt)}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {!expired && (
                        <>
                          <select
                            value={extendValue}
                            onChange={(e) =>
                              setExtendValue(e.target.value)
                            }
                            className={select}
                          >
                            <option value="1h">+1h</option>
                            <option value="1d">+1d</option>
                            <option value="7d">+7d</option>
                          </select>

                          <button className={buttonPrimary}>
                            Extend
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDownload(f._id)}
                        className={buttonSuccess}
                      >
                        Download
                      </button>

                      <button
                        onClick={() => handleDelete(f._id)}
                        className={buttonDanger}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </PageLayout>
  );
};

export default Dashboard;
