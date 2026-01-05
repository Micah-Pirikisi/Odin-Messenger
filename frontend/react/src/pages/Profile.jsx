import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useLocation, useNavigate } from "react-router-dom";

export default function Profile() {
  const location = useLocation();
  const nav = useNavigate();
  const [user, setUser] = useState(location.state?.user || null);
  const [file, setFile] = useState(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNewStatus(user.status || "Available");
      return;
    }
    // Fetch user if not provided via navigation state
    api
      .get("/users/me")
      .then((res) => {
        setUser(res.data);
        setNewStatus(res.data.status || "Available");
      })
      .catch(() => {
        setUser(null);
        nav("/");
      });
  }, [user, nav]);

  async function handleUploadAvatar(e) {
    e.preventDefault();
    if (!file) return alert("Choose a file first");
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await api.post("/users/me/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Upload failed");
    }
  }

  async function handleUpdateStatus(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/users/me/status", { status: newStatus });
      setUser((prev) => ({ ...prev, status: res.data.status }));
      setEditingStatus(false);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Status update failed");
      setLoading(false);
    }
  }

  if (!user)
    return <div style={{ color: "#666", fontSize: 16 }}>Loading...</div>;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 24px",
          maxWidth: 600,
          margin: "0 auto",
          height: "100%",
          overflow: "auto",
        }}
      >
        {/* Avatar Section */}
        <div
          style={{
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 140,
              height: 140,
              margin: "0 auto 16px",
            }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2aabee, #25d366)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 56,
                  fontWeight: 700,
                }}
              >
                {(user.name || user.email).slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <form
            onSubmit={handleUploadAvatar}
            style={{ display: "flex", gap: 8, justifyContent: "center" }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {file ? "Upload" : "Change"}
            </button>
          </form>
        </div>

        {/* User Info Section */}
        <div
          style={{
            background: "var(--panel-bg)",
            padding: "24px",
            borderRadius: "12px",
            width: "100%",
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--muted)",
                marginBottom: 6,
              }}
            >
              Name
            </label>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text)",
                margin: 0,
              }}
            >
              {user.name}
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--muted)",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <p style={{ fontSize: 14, color: "var(--text)", margin: 0 }}>
              {user.email}
            </p>
          </div>

          {/* Status Section */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--muted)",
                marginBottom: 6,
              }}
            >
              Status
            </label>
            {editingStatus ? (
              <form
                onSubmit={handleUpdateStatus}
                style={{ display: "flex", gap: 8 }}
              >
                <input
                  type="text"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  maxLength={100}
                  placeholder="Enter your status"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: 14,
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "8px 14px",
                    background: "var(--accent)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingStatus(false);
                    setNewStatus(user.status || "Available");
                  }}
                  style={{
                    padding: "8px 14px",
                    background: "#e5e7eb",
                    color: "var(--text)",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div
                onClick={() => setEditingStatus(true)}
                style={{
                  padding: "8px 12px",
                  background: "#f3f4f6",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "var(--text)",
                  fontSize: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{user.status || "Add a status"}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>✎</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => nav("/home")}
          style={{
            padding: "12px 24px",
            background:
              "linear-gradient(90deg, var(--accent), var(--accent-2))",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Back to Chat
        </button>
      </div>
    </div>
  );
}
