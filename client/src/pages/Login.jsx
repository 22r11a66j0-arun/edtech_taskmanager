import React, { useState, useContext } from "react";
import { AuthContext } from "../App";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    try {
      const res = await API.post("/auth/login", { email, password });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("userId", res.data.userId);

        setAuth({
          token: res.data.token,
          role: res.data.role,
          userId: res.data.userId,
        });

        navigate("/dashboard");
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: "400px" }}>
      <h2 style={{ textAlign: "center" }}>Welcome Back</h2>

      <form className="form" onSubmit={submit}>
        <label>Email</label>
        <input
          className="input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          className="input"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {err && <p style={{ color: "red" }}>{err}</p>}

        <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
          Login
        </button>

        <p style={{ textAlign: "center" }}>
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}
