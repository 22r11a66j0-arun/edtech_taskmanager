import React, { useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const body = { email, password, role };
      if (role === "student") body.teacherId = teacherId;

      const res = await API.post("/auth/signup", body);
      if (res.data.success) nav("/login");
    } catch (e) {
      setErr(e.response?.data?.message);
    }
  };

  return (
    <div className="app-container">
      <h2>Signup</h2>
      <form className="form" onSubmit={submit}>
        <select className="input" value={role} onChange={(e)=>setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />

        {role === "student" && (
          <input className="input" placeholder="Teacher ID" value={teacherId} onChange={(e)=>setTeacherId(e.target.value)} />
        )}

        {err && <p style={{color:"red"}}>{err}</p>}

        <button className="btn btn-primary">Signup</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
