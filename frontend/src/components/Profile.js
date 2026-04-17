import { useState, useEffect, useCallback } from "react";
import API_BASE from "../config";

function Profile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioMessage, setBioMessage] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}`);
      if (!response.ok) { setError("Could not load profile."); return; }
      const data = await response.json();
      setProfile(data);
      setBio(data.bio || "");
    } catch (err) {
      setError("Error connecting to backend.");
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const response = await fetch(`${API_BASE}/upload/${userId}`, { method: "POST", body: formData });
      if (response.ok) fetchProfile();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleBioSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}/bio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      const data = await response.json();
      setBioMessage(data.message);
      setEditingBio(false);
      fetchProfile();
    } catch (err) {
      setBioMessage("Error saving bio.");
    }
  };

  if (error) return <div className="card"><p className="error">{error}</p></div>;
  if (!profile) return <div className="card"><p className="muted">Loading...</p></div>;

  return (
    <div className="card">
      <h2>My Profile</h2>
      <div className="profile-info">

        {profile.profile_pic ? (
          <img src={`${API_BASE}${profile.profile_pic}`} alt="Profile" className="avatar-img" />
        ) : (
          <div className="avatar avatar-lg">{profile.username[0].toUpperCase()}</div>
        )}

        <h3>{profile.username}</h3>

        {/* Bio — view or edit mode */}
        {editingBio ? (
          <form onSubmit={handleBioSave} style={{ width: "100%", marginTop: "8px" }}>
            <input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              maxLength={300}
            />
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <button type="submit">Save</button>
              <button type="button" className="logout-btn" onClick={() => setEditingBio(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p style={{ marginBottom: "8px" }}>{profile.bio || "No bio yet."}</p>
            <button className="logout-btn" onClick={() => setEditingBio(true)}>
              Edit Bio
            </button>
          </>
        )}

        {bioMessage && <p className="muted" style={{ marginTop: "8px" }}>{bioMessage}</p>}

        <label className="upload-btn" style={{ marginTop: "16px" }}>
          {uploading ? "Uploading..." : "Change Photo"}
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
        </label>

      </div>
    </div>
  );
}

export default Profile;
