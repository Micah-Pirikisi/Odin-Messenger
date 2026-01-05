import React, { useState, useRef } from "react";
import MessageList from "./MessageList";

export default function ChatLayout({ currentUser }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "them",
      text: "Hey — are we still on for today?",
      time: "13:42",
    },
    {
      id: 2,
      from: "me",
      text: "Yep, see you at 3pm.",
      time: "13:43",
      status: "read",
    },
  ]);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  function send(imageUrl = null) {
    if (!text.trim() && !imageUrl) return;
    const msg = {
      id: Date.now(),
      from: "me",
      text: text.trim(),
      imageUrl,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };
    setMessages((prev) => [...prev, msg]);
    setText("");
    setShowEmojiPicker(false);
    // TODO: send to backend / websocket
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

  return (
    <div className="app-shell">
      <div className="chat-panel">
        <div className="chat-header">
          <div className="avatar">
            {(currentUser.name || currentUser.email).slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="title">{currentUser.name || currentUser.email}</div>
            <div className="subtitle">Online</div>
          </div>
        </div>

        <div className="messages" id="messages">
          <MessageList messages={messages} />
        </div>

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
