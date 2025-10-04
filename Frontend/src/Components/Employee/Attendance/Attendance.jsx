import React, { useEffect, useState } from "react";
import "./Attendance.css";
import { FaPlayCircle, FaStopCircle, FaCoffee } from "react-icons/fa";
import axios from "axios";

const Attendance = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState("Clocked Out");
  const [todayHours, setTodayHours] = useState("0h 0m");
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [message, setMessage] = useState(""); 
  const [showAll, setShowAll] = useState(false); 
  const [loading, setLoading] = useState(true);

  const [breakActive, setBreakActive] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [totalBreakMs, setTotalBreakMs] = useState(0);

  const BASE_URL = "http://localhost:5000/api/attendance";
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");

  if (!token) return <p style={{ padding: "20px" }}>User not logged in!</p>;

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => (date ? new Date(date).toLocaleTimeString() : "-");

  // Calculate total hours subtracting break time
  const calculateTotalHours = (sessions) => {
    if (!sessions?.length) return "0h 0m";
    let totalMs = 0, breakMs = 0;
    sessions.forEach((s) => {
      if (s.clockIn && s.clockOut) totalMs += new Date(s.clockOut) - new Date(s.clockIn);
      s.breaks?.forEach((b) => {
        if (b.start && b.end) breakMs += new Date(b.end) - new Date(b.start);
      });
    });
    const workedMs = totalMs - breakMs - totalBreakMs; // subtract ongoing break
    const hours = Math.floor(workedMs / 3600000);
    const minutes = Math.floor((workedMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const updateTodayRecord = (records) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const record = records.find(a => new Date(a.date).toISOString().split("T")[0] === todayStr) || null;
    setTodayRecord(record);

    if (record?.sessions?.length) {
      const lastSession = record.sessions[record.sessions.length - 1];
      setAttendanceStatus(lastSession.clockOut ? "Clocked Out" : "Clocked In");
      setTodayHours(calculateTotalHours(record.sessions));
      setTotalBreakMs(0);
      setBreakActive(false);
      setBreakStartTime(null);
    } else {
      setAttendanceStatus("Clocked Out");
      setTodayHours("0h 0m");
      setTotalBreakMs(0);
      setBreakActive(false);
      setBreakStartTime(null);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/history`, axiosConfig);
      setAttendanceHistory(res.data);
      updateTodayRecord(res.data);
    } catch (err) {
      console.error("Fetch attendance error:", err);
      setMessage("Failed to fetch attendance history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const getIP = async () => {
    try {
      const res = await axios.get("https://api.ipify.org?format=json");
      return res.data.ip;
    } catch {
      return "Unknown IP";
    }
  };

  // Clock In / Clock Out
  const handleClock = async () => {
    if (attendanceStatus === "Clocked In" && breakActive) {
      handleBreak(); // stop break automatically before clock out
    }
    try {
      const ip = await getIP();
      const res = await axios.post(`${BASE_URL}/clock`, { ip }, axiosConfig);
      setMessage(res.data.message);

      if (res.data.record) {
        const updatedHistory = [
          ...attendanceHistory.filter(r => r._id !== res.data.record._id),
          res.data.record
        ];
        setAttendanceHistory(updatedHistory);
        updateTodayRecord(updatedHistory);
      } else fetchAttendance();
    } catch (err) {
      console.error("Clock error:", err);
      setMessage(err.response?.data?.message || "Error clocking in/out");
    }
  };

  // Break toggle
  const handleBreak = async () => {
    if (!breakActive) {
      setBreakActive(true);
      setBreakStartTime(new Date());
    } else {
      const endTime = new Date();
      const startTime = breakStartTime || new Date();
      setTotalBreakMs(prev => prev + (endTime - startTime));

      try {
        const res = await axios.post(
          `${BASE_URL}/break`,
          { type: "Short Break", start: startTime, end: endTime },
          axiosConfig
        );
        setMessage("Break recorded");

        if (res.data.record) {
          const updatedHistory = [
            ...attendanceHistory.filter(r => r._id !== res.data.record._id),
            res.data.record
          ];
          setAttendanceHistory(updatedHistory);
          updateTodayRecord(updatedHistory);
        } else fetchAttendance();
      } catch (err) {
        console.error("Break error:", err);
        setMessage(err.response?.data?.message || "Error recording break");
      }

      setBreakActive(false);
      setBreakStartTime(null);
    }
  };

  const weeklyOverview = () => {
    const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const record = attendanceHistory.find(a => new Date(a.date).toDateString() === date.toDateString());
      return {
        day: weekDays[date.getDay()],
        totalHours: record?.sessions ? calculateTotalHours(record.sessions) : "0h 0m",
        status: record?.status || "Absent",
      };
    });
  };

  return (
    <div className="attendance-container">
      <h2 className="page-title">Attendance & Time Tracking</h2>
      <p className="subtitle">Hello {name}, track your work hours and manage attendance records.</p>

      {message && <div className="inline-message">{message}</div>}

      <div className="time-clock-card">
        <div className="current-time">
          <h1>{currentTime.toLocaleTimeString()}</h1>
          <p>Current Time</p>
        </div>

        <div className="clock-info">
          <p><strong>{todayRecord?.sessions?.[0]?.clockIn ? formatTime(todayRecord.sessions[0].clockIn) : "-"}</strong> <span>First Clock In</span></p>
          <p><strong>{todayRecord?.sessions?.[todayRecord.sessions.length - 1]?.clockOut ? formatTime(todayRecord.sessions[todayRecord.sessions.length - 1].clockOut) : "-"}</strong> <span>Last Clock Out</span></p>
          <p><strong>{todayHours}</strong> <span>Today's Hours</span></p>
          <p className="status">
            Status: <span className={attendanceStatus === "Clocked Out" ? "red-dot" : "present-dot"}></span> {attendanceStatus}
          </p>
        </div>

        <div className="clock-buttons">
          <button className="clock-btn" onClick={handleClock}>
            {attendanceStatus === "Clocked Out" ? <FaPlayCircle /> : <FaStopCircle />}
            {attendanceStatus === "Clocked Out" ? " Clock In" : " Clock Out"}
          </button>

          {attendanceStatus === "Clocked In" && (
            <button className={`break-btn ${breakActive ? "break-active" : ""}`} onClick={handleBreak}>
              <FaCoffee /> {breakActive ? " Break On" : " Break Off"}
            </button>
          )}
        </div>
      </div>

      {todayRecord?.sessions?.map((session, idx) => (
        <div key={idx} className="break-info">
          <h4>Session {idx + 1} Breaks:</h4>
          {session.breaks?.length ? session.breaks.map((b, i) => (
            <p key={i}>{b.type}: {b.duration || "-"} </p>
          )) : <p>No breaks in this session</p>}
        </div>
      ))}

      <div className="weekly-cards">
        {weeklyOverview().map((day, i) => (
          <div key={i} className={`week-card ${day.status.toLowerCase()}`}>
            <h4>{day.day}</h4>
            <p>{day.totalHours}</p>
            <p>{day.status}</p>
          </div>
        ))}
      </div>

      <button className="show-all-btn" onClick={() => setShowAll(!showAll)}>
        {showAll ? "Hide Full History" : "See All Attendance"}
      </button>

      {showAll && !loading && (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th><th>Clock In</th><th>Clock Out</th><th>Total Hours</th>
              <th>Break</th><th>Status</th><th>Location</th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.map(record => (
              <tr key={record._id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.sessions?.map(s => formatTime(s.clockIn)).join(", ") || "-"}</td>
                <td>{record.sessions?.map(s => formatTime(s.clockOut)).join(", ") || "-"}</td>
                <td>{record.sessions ? calculateTotalHours(record.sessions) : "0h 0m"}</td>
                <td>{record.sessions?.flatMap(s => s.breaks?.map(b => `${b.type}: ${b.duration || "-"}`) || []).join(", ") || "-"}</td>
                <td>{record.status || "-"}</td>
                <td>{record.locationIP || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Attendance;
