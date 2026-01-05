import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/client";
import MessageList from "../components/MessageList";

export default function Chat() {
  const { conversationId } = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const [conversation, setConversation] = useState(
    location.state?.conversation || null
  );
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const emojis = [
    "😀",
    "😂",
    "😍",
    "🤔",
    "😢",
    "😡",
    "👍",
    "👎",
    "❤️",
    "🎉",
    "🔥",
    "💯",
  ];

  // Fetch conversation if not provided
  useEffect(() => {
    if (!conversation) {
      api
        .get(`/users/conversations`)
        .then((res) => {
          const found = res.data.find((c) => c.id === parseInt(conversationId));
          if (found) setConversation(found);
        })
        .catch((err) => {
          console.error(err);
          nav("/home");
        })
        .finally(() => setLoading(false));
    }
  }, [conversationId, conversation, nav]);

  // Sync messages when conversation changes
  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages || []);
      setLoading(false);
    }
  }, [conversation]);

  function send(imageUrl = null) {
    if (!text.trim() && !imageUrl) return;

    const optimisticMsg = {
      id: Date.now(),
      from: "me",
      text: text.trim(),
      imageUrl,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sending",
    };

    // Update UI
    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");
    setShowEmojiPicker(false);

    // 🔥 Send to backend
    api
      .post("/users/messages", {
        content: text.trim(),
        conversationId: parseInt(conversationId), // from useParams()
        imageUrl,
      })
      .then((res) => {
        // Replace optimistic message with server response
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMsg.id
              ? {
                  ...res.data, // backend returns id, createdAt, sender, etc.
                  from: "me",
                  status: "sent",
                }
              : m
          )
        );
      })
      .catch((err) => {
        console.error("Failed to save message:", err);
        // Mark optimistic message as failed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMsg.id ? { ...m, status: "error" } : m
          )
        );
      });
  }

  function insertEmoji(emoji) {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result;
      send(imageUrl);
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        Loading...
      </div>
    );
  }

  const otherParticipant = conversation?.participants.find(
    (p) => p.userId !== JSON.parse(localStorage.getItem("userId") || "0")
  );

  return (
    <div className="app-shell">
      <div className="chat-panel">
        {/* Header */}
        <div className="chat-header">
          <button
            onClick={() => nav("/home")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              padding: "6px",
              marginRight: 8,
            }}
          >
            ←
          </button>
          <div className="avatar">
            {(otherParticipant?.user?.name || otherParticipant?.user?.email)
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="title">
              {otherParticipant?.user?.name || otherParticipant?.user?.email}
            </div>
            <div className="subtitle">
              {otherParticipant?.user?.status || "Available"}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages" id="messages">
          <MessageList messages={messages} />
        </div>

        {/* Composer */}
        <div className="composer">
          <div className="input-wrap">
            <button
              className="icon-btn"
              title="Attach Image"
              onClick={() => fileInputRef.current?.click()}
            >
              🖼️
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <input
              type="text"
              placeholder="Message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              className="icon-btn"
              title="Emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>
          </div>
          <button className="send-btn" onClick={() => send()}>
            Send
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  className="emoji-btn"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
