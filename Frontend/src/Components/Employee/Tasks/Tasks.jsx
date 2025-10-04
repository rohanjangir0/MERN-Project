import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Tasks.css";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState({});
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("Medium");

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

  const handleSelectProgress = (taskId, value) => {
    setSelectedProgress((prev) => ({ ...prev, [taskId]: value }));
  };

  const handleConfirmProgress = async (task) => {
    const progress = selectedProgress[task._id];
    if (!progress) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/tasks/update/${task._id}`,
        { progress }
      );
      setSelectedProgress((prev) => ({ ...prev, [task._id]: undefined }));
      fetchTasks();
    } catch (err) {
      console.error("Error confirming progress:", err);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle || !newTaskDesc) return;

    try {
      await axios.post(`http://localhost:5000/api/tasks/personal/create`, {
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        assignedTo: employeeId,
      });
      setShowNewTask(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
      fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  // Start editing personal task
  const handleEditTask = (task) => {
    setEditTaskId(task._id);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description);
    setEditTaskPriority(task.priority);
  };

  const handleSaveEdit = async (taskId) => {
    try {
      await axios.patch(`http://localhost:5000/api/tasks/update/${taskId}`, {
        title: editTaskTitle,
        description: editTaskDesc,
        priority: editTaskPriority,
      });
      setEditTaskId(null);
      fetchTasks();
    } catch (err) {
      console.error("Error editing task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status completed";
      case "In Progress":
        return "status inprogress";
      default:
        return "status todo";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "priority high";
      case "Medium":
        return "priority medium";
      case "Low":
        return "priority low";
      default:
        return "priority";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    if (activeTab === "assigned") return task.assignedBy === "Admin";
    if (activeTab === "personal") return task.assignedBy === "Self";
    return true;
  });

  const getTimeTaken = (task) => {
    const start = new Date(task.startTime);
    const end = task.endTime ? new Date(task.endTime) : new Date();
    const diff = Math.round((end - start) / 60000);
    return `${diff} min`;
  };

  return (
    <div className="tasks-dashboard">
      <div className="header">
        <div>
          <h2>Tasks & Activities</h2>
          <p>Manage your tasks efficiently.</p>
        </div>
        <button className="new-task-btn" onClick={() => setShowNewTask(true)}>
          + New Personal Task
        </button>
      </div>

      {showNewTask && (
        <div className="new-task-modal">
          <h3>Create Personal Task</h3>
          <input
            type="text"
            placeholder="Task Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <textarea
            placeholder="Task Description"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value)}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <div className="modal-buttons">
            <button onClick={handleCreateTask}>Create</button>
            <button onClick={() => setShowNewTask(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="summary-cards">
        <div className="card total">
          <span>Total Tasks</span>
          <h3>{tasks.length}</h3>
        </div>
        <div className="card in-progress">
          <span>In Progress</span>
          <h3>{tasks.filter((t) => t.status === "In Progress").length}</h3>
        </div>
        <div className="card completed">
          <span>Completed</span>
          <h3>{tasks.filter((t) => t.status === "Completed").length}</h3>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          className={activeTab === "assigned" ? "active" : ""}
          onClick={() => setActiveTab("assigned")}
        >
          Assigned by Admin ({tasks.filter((t) => t.assignedBy === "Admin").length})
        </button>
        <button
          className={activeTab === "personal" ? "active" : ""}
          onClick={() => setActiveTab("personal")}
        >
          Personal Tasks ({tasks.filter((t) => t.assignedBy === "Self").length})
        </button>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <p className="no-task">No tasks here.</p>
        ) : (
          filteredTasks.map((task) => (
            <div className="task-card" key={task._id}>
              <div className="task-header">
                {editTaskId === task._id ? (
                  <input
                    type="text"
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                  />
                ) : (
                  <h3>{task.title}</h3>
                )}
                <span className={getStatusClass(task.status)}>{task.status}</span>
              </div>

              {editTaskId === task._id ? (
                <textarea
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                />
              ) : (
                <p className="task-desc">{task.description}</p>
              )}

              <div className="task-meta">
                {editTaskId === task._id ? (
                  <select
                    value={editTaskPriority}
                    onChange={(e) => setEditTaskPriority(e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                ) : (
                  <span className={getPriorityClass(task.priority)}>
                    {task.priority} Priority
                  </span>
                )}
                <span>⏱ Time Taken: {getTimeTaken(task)}</span>
              </div>

              <div className="progress-options">
                {[25, 50, 75, 100].map((value) => (
                  <button
                    key={value}
                    disabled={task.progress >= value}
                    className={task.progress >= value ? "disabled-option" : ""}
                    onClick={() => handleSelectProgress(task._id, value)}
                  >
                    {value}%
                  </button>
                ))}

                {selectedProgress[task._id] && task.progress < 100 && (
                  <button
                    className="confirm-btn"
                    onClick={() => handleConfirmProgress(task)}
                  >
                    Confirm
                  </button>
                )}

                {/* Edit/Save/Delete buttons for personal tasks */}
                {task.assignedBy === "Self" && (
                  <>
                    {editTaskId === task._id ? (
                      <button
                        className="save-btn"
                        onClick={() => handleSaveEdit(task._id)}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="edit-btn"
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
