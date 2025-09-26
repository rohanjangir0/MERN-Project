import React, { useEffect, useRef, useState } from "react";
import "./EmployeeDashboard.css";
import axios from "axios";

export default function EmployeeDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [newReminder, setNewReminder] = useState("");

  const employeeName = localStorage.getItem("name") || "Employee";

  // Clock refs
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const secondRef = useRef(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/announcements")
      .then((res) => setAnnouncements(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      const hourDeg = hours * 30 + minutes * 0.5;
      const minuteDeg = minutes * 6 + seconds * 0.1;
      const secondDeg = seconds * 6 + milliseconds * 0.006;

      if (hourRef.current) hourRef.current.style.transform = `rotate(${hourDeg}deg)`;
      if (minuteRef.current) minuteRef.current.style.transform = `rotate(${minuteDeg}deg)`;
      if (secondRef.current) secondRef.current.style.transform = `rotate(${secondDeg}deg)`;
    };

    const interval = setInterval(updateClock, 50);
    updateClock();
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { title: "Tasks Completed", value: 24, sub: "+3 today", color: "#3b82f6" },
    { title: "Hours Worked", value: "8h 32m", sub: "Today", color: "#2563eb" },
    { title: "Pending Tasks", value: 8, sub: "2 urgent", color: "#fbbf24" },
    { title: "Leave Balance", value: "12 days", sub: "Available", color: "#ef4444" },
  ];

  const actions = [
    "Create Task",
    "Request Leave",
    "Submit Expense",
    "Team Chat",
    "View Team",
  ];

  const achievements = [
    { title: "Projects Completed", value: 24 },
    { title: "Top Performer", value: "This Month" },
  ];

  const handleAddReminder = () => {
    if (!newReminder) return;
    const now = new Date();
    setReminders([{ task: newReminder, time: now.toLocaleString() }, ...reminders]);
    setNewReminder("");
    setShowReminderPopup(false);
  };

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="welcome-box">
          <h2>Welcome Back</h2>
          <h1>{employeeName}</h1>
        </div>
        <div className="clock-box">
          <div className="analog-clock">
            <div className="clock-face">
              <span ref={hourRef} className="hand hour-hand"></span>
              <span ref={minuteRef} className="hand minute-hand"></span>
              <span ref={secondRef} className="hand second-hand"></span>
              <div className="center-dot"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="stats-row">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card" style={{ background: stat.color }}>
            <h4>{stat.title}</h4>
            <p className="stat-value">{stat.value}</p>
            <span className="stat-sub">{stat.sub}</span>
          </div>
        ))}
      </section>

      <div className="dashboard-content">
        {/* Left Column */}
        <div className="left-col">
          {/* Announcements */}
          <section className="announcements">
            <h3>Announcements</h3>
            <div className="announcement-scroll">
              {announcements.slice(0, 4).map((a, idx) => (
                <div key={idx} className="announcement-card">
                  <h4>{a.subject}</h4>
                  <p>{a.description}</p>
                  <span className="meta">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              ))}
              {announcements.length > 4 && <span className="see-more">See More...</span>}
            </div>
          </section>

          {/* Reminders */}
          <section className="reminders">
            <h3>Reminders</h3>
            <div className="reminder-card main" onClick={() => setShowReminderPopup(true)}>
              <p>+ Add New Reminder</p>
            </div>
            {reminders.map((r, idx) => (
              <div key={idx} className="reminder-card">
                <p>{r.task}</p>
                <span>{r.time}</span>
              </div>
            ))}
          </section>
        </div>

        {/* Right Column */}
        <div className="right-col">
          {/* Quick Actions List */}
          <section className="quick-actions-list">
            <h3>Quick Actions</h3>
            <div className="actions-scroll">
              {actions.map((act, idx) => (
                <div key={idx} className="action-list-item">
                  <span>•</span>
                  <p>{act}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Achievements */}
          <section className="achievements">
            <h3>Achievements</h3>
            {achievements.map((a, idx) => (
              <div key={idx} className="achievement-card">
                <p>{a.title}</p>
                <span>{a.value}</span>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* Reminder Popup */}
      {showReminderPopup && (
        <div className="reminder-popup">
          <div className="popup-content">
            <h3>Add Reminder</h3>
            <input
              type="text"
              placeholder="Enter task"
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
            />
            <div className="popup-buttons">
              <button onClick={handleAddReminder}>Add</button>
              <button onClick={() => setShowReminderPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
