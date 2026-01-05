import React from "react";

function MessageRow({ m }) {
  const isMe = m.from === "me";
  return (
    <div className={`msg-row ${isMe ? "sent" : "recv"}`}>
      {!isMe && <div className="avatar">TB</div>}
      <div className="msg-group">
        {m.imageUrl && (
          <img
            src={m.imageUrl}
            alt="message"
            style={{
              maxWidth: "200px",
              borderRadius: "var(--radius)",
              marginBottom: m.text ? "8px" : "0",
            }}
          />
        )}
        {m.text && (
          <div className={`bubble ${isMe ? "sent" : "recv"}`}>
            {m.text}
            <div className="meta">
              <span className="timestamp">{m.time}</span>
              {isMe && (
                <span style={{ marginLeft: 6 }}>
                  {m.status === "read" ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          </div>
        )}
        {m.imageUrl && !m.text && (
          <div className="meta">
            <span className="timestamp">{m.time}</span>
            {isMe && (
              <span style={{ marginLeft: 6 }}>
                {m.status === "read" ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        )}
      </div>
      {isMe && <div style={{ width: 40 }} />}
    </div>
  );
}

export default function MessageList({ messages = [] }) {
  return (
    <>
      {messages.map((m) => (
        <MessageRow key={m.id} m={m} />
      ))}
    </>
  );
}
