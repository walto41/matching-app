import { useState, useEffect, useRef, useCallback } from "react";
import API_BASE from "../config";

function Chat({ currentUserId, otherUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null); // used to auto-scroll to latest message

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/messages/${currentUserId}/${otherUser.id}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [currentUserId, otherUser.id]);

  // Load messages when the chat opens, then refresh every 3 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval); // stop polling when chat closes
  }, [fetchMessages]);

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await fetch(`${API_BASE}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: otherUser.id,
          content: newMessage,
        }),
      });

      setNewMessage("");
      fetchMessages(); // refresh immediately after sending
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <strong>{otherUser.username}</strong>
        <button className="logout-btn" onClick={onClose}>Close</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="muted" style={{ textAlign: "center", marginTop: "20px" }}>
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.sender_id === currentUserId ? "mine" : "theirs"}`}
          >
            <span>{msg.content}</span>
            <small>{msg.timestamp}</small>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
