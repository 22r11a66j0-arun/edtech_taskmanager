import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import API from "../api";

export default function Dashboard() {
  const { auth, logout, setAuth } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  // create fields
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMe = async () => {
    try {
      const res = await API.get("/auth/me");
      if (res.data.success) setAuth(prev => ({ ...prev, user: res.data.user }));
    } catch {}
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get("/tasks");
      if (res.data.success) setTasks(res.data.tasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    loadTasks();
    // eslint-disable-next-line
  }, []);

  const filtered = tasks.filter(t => filter === "all" ? true : t.progress === filter);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tasks", {
        userId: auth.userId,
        title,
        description: desc,
        dueDate: due || null
      });
      setTitle(""); setDesc(""); setDue("");
      loadTasks();
    } catch (e) {
      alert(e.response?.data?.message || "Create failed");
    }
  };

  const updateProgress = async (id, progress) => {
    try {
      await API.put(`/tasks/${id}`, { progress });
      loadTasks();
    } catch (e) {
      alert(e.response?.data?.message || "Update failed");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      loadTasks();
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  const stats = {
    total: tasks.length,
    notStarted: tasks.filter(t => t.progress === "not-started").length,
    inProgress: tasks.filter(t => t.progress === "in-progress").length,
    completed: tasks.filter(t => t.progress === "completed").length
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-left">
          <div className="user-pill">
            <div style={{width:34, height:34, borderRadius:8, background:"#eef2ff", color: "#2563eb", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700}}>
              {auth.role ? auth.role[0].toUpperCase() : "U"}
            </div>
            <div style={{marginLeft:8}}>
              <div style={{fontWeight:700}}>{auth.user?.email || auth.userId}</div>
              <div className="small">{auth.role?.toUpperCase()}</div>
            </div>
          </div>
        </div>

        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat card">
          <h4>Total tasks</h4>
          <div className="big">{stats.total}</div>
        </div>
        <div className="stat card">
          <h4>In progress</h4>
          <div className="big">{stats.inProgress}</div>
        </div>
        <div className="stat card">
          <h4>Completed</h4>
          <div className="big">{stats.completed}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <h3>Tasks</h3>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <select className="select" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button className="btn btn-ghost" onClick={loadTasks}>Refresh</button>
            </div>
          </div>

          <div className="tasks">
            {filtered.length === 0 && <div className="small">No tasks found. Create your first task!</div>}
            {filtered.map(task => (
              <div className="task-card card" key={task._id}>
                <div className="task-meta">
                  <div className="task-title">{task.title}</div>
                  <div className="task-desc">{task.description || "No description"}</div>
                  <div className="task-footer">
                    <div className={`badge ${task.progress.replace(" ", "-")}`}>{task.progress}</div>
                    <div className="small">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</div>
                    <div className="small">Owner: {task.userId}</div>
                  </div>
                </div>

                <div style={{display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end"}}>
                  <select className="select" value={task.progress} onChange={(e)=>updateProgress(task._id, e.target.value)}>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div style={{display:"flex", gap:8}}>
                    <button className="btn btn-danger" onClick={()=>deleteTask(task._1d || task._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="side-card card">
            <h4>Create Task</h4>
            <form className="create-form" onSubmit={createTask}>
              <input className="input" placeholder="Task title" value={title} onChange={e=>setTitle(e.target.value)} required />
              <input className="input" placeholder="Short description" value={desc} onChange={e=>setDesc(e.target.value)} />
              <input className="input" type="date" value={due} onChange={e=>setDue(e.target.value)} />
              <button className="btn btn-primary" type="submit">Create Task</button>
            </form>

            <div style={{marginTop:14}}>
              <h4 style={{marginBottom:8}}>Quick filters</h4>
              <div style={{display:"flex", gap:8}}>
                <button className="btn" onClick={()=>setFilter("all")}>All</button>
                <button className="btn" onClick={()=>setFilter("in-progress")}>In Progress</button>
                <button className="btn" onClick={()=>setFilter("completed")}>Completed</button>
              </div>
            </div>
          </div>

          <div style={{height:14}} />

          <div className="side-card card">
            <h4>About</h4>
            <div className="small">This dashboard shows tasks visible to your role. Teachers see their own tasks and tasks of their assigned students. Students see only their own tasks.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
