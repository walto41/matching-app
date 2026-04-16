import { useState } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Matches from "./components/Matches";
import Profile from "./components/Profile";
import Users from "./components/Users";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null); // null = not logged in
  const [activeTab, setActiveTab] = useState("Login");

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActiveTab("Users");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("Login");
  };

  // What to render depends on whether the user is logged in
  if (!currentUser) {
    return (
      <div className="app-container">
        <h1>Matchmaking App</h1>
        <p className="tagline">Find your match</p>

        <div className="tabs">
          <button
            className={activeTab === "Login" ? "active" : ""}
            onClick={() => setActiveTab("Login")}
          >
            Login
          </button>
          <button
            className={activeTab === "Register" ? "active" : ""}
            onClick={() => setActiveTab("Register")}
          >
            Register
          </button>
        </div>

        {activeTab === "Login" && <Login onLogin={handleLogin} />}
        {activeTab === "Register" && <Register />}
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Matchmaking App</h1>
        <div className="user-bar">
          <span>Hi, <strong>{currentUser.username}</strong></span>
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "Users" ? "active" : ""}
          onClick={() => setActiveTab("Users")}
        >
          Browse
        </button>
        <button
          className={activeTab === "Matches" ? "active" : ""}
          onClick={() => setActiveTab("Matches")}
        >
          Matches
        </button>
        <button
          className={activeTab === "Profile" ? "active" : ""}
          onClick={() => setActiveTab("Profile")}
        >
          Profile
        </button>
      </div>

      {activeTab === "Profile" && <Profile userId={currentUser.id} />}
      {activeTab === "Matches" && <Matches userId={currentUser.id} />}
      {activeTab === "Users" && <Users currentUserId={currentUser.id} />}
    </div>
  );
}

export default App;
