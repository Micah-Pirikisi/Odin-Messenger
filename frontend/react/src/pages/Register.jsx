import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

export default function Register({ onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password, name });

      // auto-login to obtain token and fetch profile
      const loginRes = await api.post("/auth/login", { email, password });
      const token = loginRes?.data?.accessToken;
      if (token)
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get("/users/me");
      localStorage.setItem("userId", res.data.id);
      if (onRegisterSuccess) onRegisterSuccess();
      nav("/home");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Registration failed");
      setLoading(false);
    }
  }

  return (
    <div className="auth-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <small style={{ color: "var(--muted)" }}>
            Min 8 chars, must include a special char (!@#$%^&*)
          </small>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <div className="auth-link">
        Already have an account? <Link to="/">Login here</Link>
      </div>
    </div>
  );
}
