import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaClock, FaHourglassHalf, FaPlus } from "react-icons/fa";
import "./TaskManagement.css";

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    project: "",
    assignedTo: "",
    assignedBy: "Admin",
    dueDate: "",
    estimatedTime: "",
  });

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.description || !newTask.assignedTo) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/tasks/create", newTask);
      setTasks([...tasks, res.data.task]);
      setShowModal(false);
      setNewTask({ title: "", description: "", priority: "Medium", status: "To Do", project: "", assignedTo: "", assignedBy: "Admin", dueDate: "", estimatedTime: "" });
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "All") return true;
    return task.status === filter;
  });

  const stats = [
    { title: "Total Tasks", value: tasks.length, icon: <FaCheckCircle />, color: "#007bff" },
    { title: "In Progress", value: tasks.filter(t => t.status === "In Progress").length, icon: <FaClock />, color: "#17a2b8" },
    { title: "Pending", value: tasks.filter(t => t.status === "To Do").length, icon: <FaHourglassHalf />, color: "#fd7e14" },
    { title: "Completed", value: tasks.filter(t => t.status === "Completed").length, icon: <FaCheckCircle />, color: "#28a745" },
  ];

  return (
    <div className="task-management">
      {/* Stats */}
      <div className="tm-stats">
        {stats.map((s, i) => (
          <div className="tm-stat-box" key={i}>
            <h3 style={{ color: s.color }}>{s.value}</h3>
            <p>{s.title}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="tm-header">
        <h2>Task Management</h2>
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          <FaPlus /> Assign New Task
        </button>
      </div>

      {/* Tabs */}
      <div className="tm-tabs">
        {["All", "To Do", "In Progress", "Completed"].map(tab => (
          <div key={tab} className={`tm-tab ${filter === tab ? "active" : ""}`} onClick={() => setFilter(tab)}>
            {tab} {tab !== "All" && `(${tasks.filter(t => t.status === tab).length})`}
          </div>
        ))}
      </div>

      {/* Task Cards */}
      <div className="tm-task-list">
        {filteredTasks.map(task => (
          <div key={task._id} className={`tm-task ${task.status.toLowerCase().replace(" ", "")}`}>
            <div className="tm-task-header">
              <h4>{task.title}</h4>
              <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
            </div>
            <p className="tm-desc">{task.description}</p>
            <div className="tm-task-info">
              <span>👤 {task.assignedTo}</span>
              <span>📂 {task.project || "No Project"}</span>
              <span>📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</span>
              <span>⏳ {task.estimatedTime || "—"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Assign New Task</h3>
            <form onSubmit={handleAddTask}>
              <input type="text" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
              <textarea placeholder="Task Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} required />
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })} required>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp.employeeId}>{emp.name}</option>
                ))}
              </select>
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
