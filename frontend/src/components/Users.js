import { useState, useEffect, useRef } from "react";
import API_BASE from "../config";

function Users({ currentUserId }) {
  const [users, setUsers]           = useState([]);
  const [index, setIndex]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [matchBanner, setMatchBanner] = useState(false);
  const [swipeDir, setSwipeDir]     = useState(null); // "like" | "pass" | null

  // Refs track drag state without causing re-renders mid-drag
  const startX    = useRef(0);
  const isDragging = useRef(false);
  const cardRef   = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE}/users`);
        const data = await response.json();
        setUsers(data.filter((u) => u.id !== currentUserId));
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUserId]);

  // ── Swipe logic ─────────────────────────────────────────────
  // Works for both touch (mobile) and mouse (desktop)

  const THRESHOLD = 80; // px needed to count as a swipe

  const onDragStart = (clientX) => {
    isDragging.current = true;
    startX.current = clientX;
  };

  const onDragMove = (clientX) => {
    if (!isDragging.current || !cardRef.current) return;
    const delta = clientX - startX.current;

    // Tilt the card as it's dragged
    cardRef.current.style.transform = `translateX(${delta}px) rotate(${delta * 0.05}deg)`;

    // Show the LIKE / PASS label based on direction
    if (delta > 20)       setSwipeDir("like");
    else if (delta < -20) setSwipeDir("pass");
    else                  setSwipeDir(null);
  };

  const onDragEnd = (clientX) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const delta = clientX - startX.current;

    if (delta > THRESHOLD) {
      handleLike();
    } else if (delta < -THRESHOLD) {
      handlePass();
    } else {
      // Not far enough — snap back to center
      if (cardRef.current) cardRef.current.style.transform = "";
      setSwipeDir(null);
    }
  };

  // Touch events (mobile)
  const onTouchStart = (e) => onDragStart(e.touches[0].clientX);
  const onTouchMove  = (e) => onDragMove(e.touches[0].clientX);
  const onTouchEnd   = (e) => onDragEnd(e.changedTouches[0].clientX);

  // Mouse events (desktop)
  const onMouseDown = (e) => onDragStart(e.clientX);
  const onMouseMove = (e) => onDragMove(e.clientX);
  const onMouseUp   = (e) => onDragEnd(e.clientX);

  // ── Actions ─────────────────────────────────────────────────

  const advance = () => {
    if (cardRef.current) cardRef.current.style.transform = "";
    setSwipeDir(null);
    setIndex((prev) => prev + 1);
  };

  const handleLike = async () => {
    const likedUser = users[index];
    try {
      const response = await fetch(`${API_BASE}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liker_id: currentUserId, liked_id: likedUser.id }),
      });
      const data = await response.json();
      if (data.message === "It's a match!") {
        setMatchBanner(true);
        setTimeout(() => setMatchBanner(false), 2500);
      }
    } catch (error) {
      console.error("Failed to like:", error);
    }
    advance();
  };

  const handlePass = () => advance();

  // ── Render ──────────────────────────────────────────────────

  if (loading) return <div className="card"><p className="muted">Loading...</p></div>;

  if (index >= users.length) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p style={{ fontSize: "2rem" }}>🎉</p>
        <p><strong>You've seen everyone!</strong></p>
        <p className="muted">Check your Matches tab.</p>
      </div>
    );
  }

  const user = users[index];

  return (
    <div>
      {matchBanner && <div className="match-banner">It's a match!</div>}

      <div
        ref={cardRef}
        className="swipe-card"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}  // cancel drag if mouse leaves the card
      >
        {/* LIKE / PASS labels appear while dragging */}
        <span className={`swipe-label like`} style={{ opacity: swipeDir === "like" ? 1 : 0 }}>LIKE</span>
        <span className={`swipe-label pass`} style={{ opacity: swipeDir === "pass" ? 1 : 0 }}>PASS</span>

        {user.profile_pic ? (
          <img src={`${API_BASE}${user.profile_pic}`} alt={user.username} className="swipe-card-image" />
        ) : (
          <div className="swipe-card-placeholder">
            {user.username[0].toUpperCase()}
          </div>
        )}

        <div className="swipe-card-overlay">
          <div className="swipe-card-name">{user.username}</div>
          <p className="swipe-card-bio">{user.bio || "No bio yet."}</p>
        </div>
      </div>

      {/* Button fallback for non-swipe users */}
      <div className="swipe-actions">
        <button className="pass-btn" onClick={handlePass} title="Pass">✕</button>
        <button className="like-btn-lg" onClick={handleLike} title="Like">♥</button>
      </div>

      <p className="muted" style={{ textAlign: "center", marginTop: "12px" }}>
        {users.length - index - 1} people left
      </p>
    </div>
  );
}

export default Users;
