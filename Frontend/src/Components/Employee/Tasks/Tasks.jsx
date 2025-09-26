import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Tasks.css";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all / assigned / personal
  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    if (!employeeId) return;
    fetchTasks();
  }, [employeeId]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tasks/employee/${employeeId}`
      );
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed": return "status completed";
      case "In Progress": return "status inprogress";
      default: return "status pending";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High": return "priority high";
      case "Medium": return "priority medium";
      case "Low": return "priority low";
      default: return "priority";
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    if (activeTab === "assigned") return task.assignedByAdmin;
    if (activeTab === "personal") return !task.assignedByAdmin;
    return true;
  });

  return (
    <div className="tasks-dashboard">
      <div className="header">
        <div>
          <h2>Tasks & Activities</h2>
          <p>Manage your assigned tasks and personal activities.</p>
        </div>
        <button className="new-task-btn">+ New Personal Task</button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card total">
          <span>Total Tasks</span>
          <h3>{tasks.length}</h3>
          <p>All assigned & personal</p>
        </div>
        <div className="card in-progress">
          <span>In Progress</span>
          <h3>{tasks.filter(t => t.status === "In Progress").length}</h3>
          <p>Currently working on</p>
        </div>
        <div className="card pending">
          <span>Pending</span>
          <h3>{tasks.filter(t => t.status === "Pending").length}</h3>
          <p>To be started</p>
        </div>
        <div className="card completed">
          <span>Completed</span>
          <h3>{tasks.filter(t => t.status === "Completed").length}</h3>
          <p>Successfully finished</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>All Tasks ({tasks.length})</button>
        <button className={activeTab === "assigned" ? "active" : ""} onClick={() => setActiveTab("assigned")}>Assigned by Admin ({tasks.filter(t => t.assignedByAdmin).length})</button>
        <button className={activeTab === "personal" ? "active" : ""} onClick={() => setActiveTab("personal")}>Personal Tasks ({tasks.filter(t => !t.assignedByAdmin).length})</button>
      </div>

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <p className="no-task">No tasks here. Add a new personal task!</p>
        ) : (
          filteredTasks.map(task => (
            <div className="task-card" key={task._id}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={getStatusClass(task.status)}>{task.status}</span>
              </div>
              <p className="task-desc">{task.description}</p>
              <div className="task-meta">
                <span className={getPriorityClass(task.priority)}>{task.priority} Priority</span>
                <span className="project">📂 {task.project || "General"}</span>
              </div>
              <div className="task-footer">
                <span>📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}</span>
                <span>⏱ {task.estimatedTime || "N/A"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
