import React, { useEffect, useState } from "react";
import "./Attendance.css";
import { FaPlayCircle, FaStopCircle } from "react-icons/fa";
import axios from "axios";

const Attendance = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState("Clocked Out");
  const [clockInTime, setClockInTime] = useState("-");
  const [clockOutTime, setClockOutTime] = useState("-");
  const [todayHours, setTodayHours] = useState("0h 0m");
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get JWT token from localStorage
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");

  // If not logged in, show message
  if (!token) {
    return (
      <p style={{ padding: "20px" }}>
        User not logged in! Please log in to access attendance.
      </p>
    );
  }

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Format date/time safely
  const formatTime = (date) => (date ? new Date(date).toLocaleTimeString() : "-");

  // Axios config with token
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch attendance history
  const fetchAttendance = async () => {
    try {
      const res = await axios.get("/api/attendance/history", axiosConfig);
      setAttendanceHistory(res.data);

      const todayStr = new Date().toISOString().split("T")[0];
      const todayRecord = res.data.find(
        (a) => new Date(a.date).toISOString().split("T")[0] === todayStr
      );

      if (todayRecord) {
        setClockInTime(formatTime(todayRecord.clockIn));
        setClockOutTime(formatTime(todayRecord.clockOut));
        setTodayHours(todayRecord.totalHours || "0h 0m");
        setAttendanceStatus(todayRecord.clockOut ? "Clocked Out" : "Clocked In");
      } else {
        setClockInTime("-");
        setClockOutTime("-");
        setTodayHours("0h 0m");
        setAttendanceStatus("Clocked Out");
      }
    } catch (err) {
      console.error("Fetch attendance error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Get public IP
  const getIP = async () => {
    try {
      const res = await axios.get("https://api.ipify.org?format=json");
      return res.data.ip;
    } catch (err) {
      console.error("IP fetch error:", err);
      return "Unknown IP";
    }
  };

  // Clock in/out
  const handleClock = async () => {
    try {
      const ip = await getIP();
      const res = await axios.post("/api/attendance/clock", { ip }, axiosConfig);
      alert(res.data.message);
      fetchAttendance();
    } catch (err) {
      console.error("Clock error:", err);
      alert(err.response?.data?.message || "Error clocking in/out");
    }
  };

  // Weekly overview
  const getWeeklyOverview = () => {
    const weekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const record = attendanceHistory.find(a => new Date(a.date).toDateString() === date.toDateString());
      return {
        day: weekDays[date.getDay()],
        totalHours: record?.totalHours || "0h 0m",
        status: record?.status || "Absent"
      };
    });
  };

  const getBreaksToday = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const record = attendanceHistory.find(a => new Date(a.date).toISOString().split("T")[0] === todayStr);
    return record?.breaks || [];
  };

  const weeklyOverview = getWeeklyOverview();
  const breaksToday = getBreaksToday();

  return (
    <div className="attendance-container">
      <h2 className="page-title">Attendance & Time Tracking</h2>
      <p className="subtitle">Hello {name}, track your work hours and manage attendance records.</p>

      {/* Time Clock Card */}
      <div className="time-clock-card">
        <div className="current-time">
          <h1>{currentTime.toLocaleTimeString()}</h1>
          <p>Current Time</p>
        </div>
        <div className="clock-info">
          <p><strong>{clockInTime}</strong> <span>Clock In</span></p>
          <p><strong>{todayHours}</strong> <span>Today's Hours</span></p>
          <p className="status">
            Status: <span className={attendanceStatus === "Clocked Out" ? "red-dot" : "present-dot"}></span> {attendanceStatus}
          </p>
        </div>
        <button className="clock-btn" onClick={handleClock}>
          {attendanceStatus === "Clocked Out" ? <FaPlayCircle size={20}/> : <FaStopCircle size={20}/>} 
          {attendanceStatus === "Clocked Out" ? " Clock In" : " Clock Out"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card"><h3>Attendance Rate</h3><p className="big-text">86%</p><span>19/22 days</span></div>
        <div className="stat-card"><h3>Total Hours</h3><p className="big-text">165h 30m</p><span>This month</span></div>
        <div className="stat-card"><h3>Avg Daily Hours</h3><p className="big-text">8h 42m</p><span>Per working day</span></div>
        <div className="stat-card"><h3>Late Days</h3><p className="big-text">1</p><span>This month</span></div>
      </div>

      {/* Attendance Table */}
      <h2 className="section-title">Attendance History</h2>
      {loading ? <p>Loading...</p> : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Total Hours</th>
              <th>Break</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.map(record => (
              <tr key={record._id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{formatTime(record.clockIn)}</td>
                <td>{formatTime(record.clockOut)}</td>
                <td>{record.totalHours || "0h 0m"}</td>
                <td>{record.breaks?.map(b => `${b.type}: ${b.duration || "-"}`).join(", ") || "-"}</td>
                <td>
                  <span className={
                    record.status === "Present" ? "present" :
                    record.status === "Late" ? "late" :
                    record.status === "Leave" ? "leave" : "red-dot"
                  }>{record.status}</span>
                </td>
                <td>{record.locationIP || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Bottom Section */}
      <div className="bottom-section">
        <div className="weekly-overview">
          <h3>Weekly Overview</h3>
          {weeklyOverview.map(day => (
            <p key={day.day}>{day.day}: {day.totalHours} {day.status === "Present" ? "✅" : day.status === "Late" ? "⚠️" : "❌"}</p>
          ))}
        </div>
        <div className="break-tracking">
          <h3>Break Tracking (Today)</h3>
          {breaksToday.length === 0 && <p>No breaks recorded</p>}
          {breaksToday.map((b, idx) => (
            <p key={idx}><strong>{b.type}:</strong> {b.start ? new Date(b.start).toLocaleTimeString() : "-"} - {b.end ? new Date(b.end).toLocaleTimeString() : "-"} ({b.duration || "-"})</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
