import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import api from "./api/client";

export default function App() {
  const nav = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = api.defaults.headers.common["Authorization"];
    if (token) {
      setIsLoggedIn(true);
      // Store userId for later use
      api
        .get("/users/me")
        .then((res) => {
          localStorage.setItem("userId", res.data.id);
        })
        .catch(() => {
          setIsLoggedIn(false);
          delete api.defaults.headers.common["Authorization"];
        });
    }
  }, []);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
      nav("/");
    } catch (err) {
      console.error(err);
    }
  }

  // Hide navbar on auth pages
  const isAuthPage =
    location.pathname === "/" || location.pathname === "/register";

  return (
    <div className="app-container">
      {!isAuthPage && (
        <nav className="app-navbar">
          <div className="navbar-brand">💬 Odin Messenger</div>
          <div className="navbar-links">
            {isLoggedIn ? (
              <>
                <Link to="/home">Chats</Link>
                <Link to="/profile">Profile</Link>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </nav>
      )}

      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Home />
              ) : (
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
              )
            }
          />
          <Route
            path="/register"
            element={<Register onRegisterSuccess={() => setIsLoggedIn(true)} />}
          />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/home"
            element={
              isLoggedIn ? (
                <Home />
              ) : (
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
              )
            }
          />
          <Route
            path="/chat/:conversationId"
            element={
              isLoggedIn ? (
                <Chat />
              ) : (
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}
