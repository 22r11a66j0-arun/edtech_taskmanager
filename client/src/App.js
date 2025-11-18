import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import API from "./api";

export const AuthContext = React.createContext();

export default function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    userId: localStorage.getItem("userId"),
    user: null
  });

  const loadMe = async () => {
    if (!auth.token) return;
    try {
      const res = await API.get("/auth/me");
      if (res.data.success) {
        setAuth((prev) => ({ ...prev, user: res.data.user }));
      }
    } catch {}
  };

  useEffect(() => { loadMe(); }, [auth.token]);

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null, userId: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={auth.token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={auth.token ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
