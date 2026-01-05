import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Home() {
  const nav = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const res = await api.get("/users/conversations");
      setConversations(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function handleSearch(q) {
    setSearchQuery(q);
    if (!q || q.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    try {
      console.log(`[FRONTEND] Searching for: "${q}"`);
      const res = await api.get("/users/search", { params: { q } });
      console.log(`[FRONTEND] Search results:`, res.data);
      setSearchResults(res.data);
    } catch (err) {
      console.error("[FRONTEND] Search error:", err);
      console.error("[FRONTEND] Error response:", err.response?.data);
      alert(`Search failed: ${err.response?.data?.error || err.message}`);
    }
  }

  async function handleStartChat(userId) {
    try {
      const res = await api.post("/users/conversations", {
        participantId: userId,
      });
      setSearchResults([]);
      setSearchQuery("");
      setShowSearch(false);
      // Navigate to the new conversation
      nav(`/chat/${res.data.id}`, { state: { conversation: res.data } });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to start chat");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "var(--panel-bg)",
      }}
    >
      {/* Header with search toggle */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #eef2f7",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Chats</h2>
        <button
          onClick={() => {
            setShowSearch(!showSearch);
            setSearchQuery("");
            setSearchResults([]);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            padding: 0,
          }}
        >
          ➕
        </button>
      </div>

      {/* Search Section */}
      {showSearch && (
        <div
          style={{
            padding: "12px",
            borderBottom: "1px solid #eef2f7",
            background: "#f9fafb",
          }}
        >
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "999px",
              fontSize: 14,
            }}
          />

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div
              style={{
                marginTop: 12,
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleStartChat(user.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: "white",
                    marginBottom: 8,
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#f3f4f6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2aabee, #25d366)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(user.name || user.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {user.name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "var(--muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.status || user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "24px 12px",
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              No users found
            </div>
          )}
        </div>
      )}

      {/* Conversations List */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--muted)",
            }}
          >
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              height: "100%",
              color: "var(--muted)",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 48 }}>💬</div>
            <p>No chats yet</p>
            <p style={{ fontSize: 12 }}>Tap + to start a new chat</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(
              (p) =>
                p.userId !== JSON.parse(localStorage.getItem("userId") || "0")
            );
            const lastMessage = conversation.messages[0];

            return (
              <div
                key={conversation.id}
                onClick={() =>
                  nav(`/chat/${conversation.id}`, {
                    state: { conversation },
                  })
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: otherParticipant?.user?.avatarUrl
                      ? `url(${otherParticipant.user.avatarUrl})`
                      : "linear-gradient(135deg, #2aabee, #25d366)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 18,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {!otherParticipant?.user?.avatarUrl &&
                    (
                      otherParticipant?.user?.name ||
                      otherParticipant?.user?.email
                    )
                      .slice(0, 2)
                      .toUpperCase()}
                </div>

                {/* Chat Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 6,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {otherParticipant?.user?.name ||
                        otherParticipant?.user?.email}
                    </p>
                    {lastMessage && (
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        {new Date(lastMessage.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lastMessage ? lastMessage.content : "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
