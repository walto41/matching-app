import { useState, useEffect } from "react";
import API_BASE from "../config";
import Chat from "./Chat";

function Matches({ userId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null); // the user currently being chatted with

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`${API_BASE}/matches/${userId}`);
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [userId]);

  // Show the chat view if a match is selected
  if (activeChat) {
    return (
      <Chat
        currentUserId={userId}
        otherUser={activeChat}
        onClose={() => setActiveChat(null)}
      />
    );
  }

  return (
    <div className="card">
      <h2>Your Matches</h2>

      {loading && <p className="muted">Loading...</p>}

      {!loading && matches.length === 0 && (
        <p className="muted">No matches yet. Keep liking!</p>
      )}

      <ul className="match-list">
        {matches.map((user) => (
          <li key={user.id} className="match-card">
            <strong>{user.username}</strong>
            <span>{user.bio}</span>
            <button
              className="like-btn"
              onClick={() => setActiveChat(user)}
            >
              Message
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Matches;
