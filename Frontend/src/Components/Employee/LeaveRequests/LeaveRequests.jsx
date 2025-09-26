import React, { useState, useEffect } from "react";
import "./LeaveRequests.css";

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState("Annual");
  const [balances, setBalances] = useState({ Annual: 0, Sick: 0, Personal: 0 });
  const [summary, setSummary] = useState({ used: 0, pending: 0, remaining: 30 });

  // Load leaves from backend
  useEffect(() => {
    async function loadLeaves() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/leaves", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const text = await res.text();
        let data = [];
        try { data = JSON.parse(text); } catch {}

        if (res.ok) {
          setRequests(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to load leaves:", data);
        }
      } catch (err) {
        console.error("Error fetching leaves:", err);
      }
    }
    loadLeaves();
  }, []);

  // Recalculate summary + breakdown
  useEffect(() => {
    const counts = { Annual: 0, Sick: 0, Personal: 0 };
    let used = 0, pending = 0;

    requests.forEach(req => {
      if (req.status === "Approved") {
        counts[req.leaveType] += 1;
        used += 1;
      }
      if (req.status === "Pending") {
        pending += 1;
      }
    });

    const totalAllowance = 30; // Example: 30 days yearly
    setBalances(counts);
    setSummary({
      used,
      pending,
      remaining: totalAllowance - used
    });
  }, [requests]);

  // Submit leave
  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) return alert("Fill all fields");

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("No token, please login");

      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leaveType, startDate, endDate, reason }),
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch {}

      if (!res.ok) throw new Error(data.error || "Failed to submit leave");

      setRequests(prev => [data, ...prev]);
      setShowForm(false);
      setStartDate(""); setEndDate(""); setReason(""); setLeaveType("Annual");
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete leave
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("No token, please login");

      const res = await fetch(`/api/leaves/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch {}

      if (!res.ok) throw new Error(data.error || "Failed to delete leave");

      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="leave-container">
      <h2 className="leave-title">Leave Dashboard</h2>
      <p className="subtitle">Manage your leave requests and balances</p>

      {/* Summary Section */}
      <div className="summary-grid">
        <div className="summary-card used">
          <h3>{summary.used}</h3>
          <p>Used</p>
        </div>
        <div className="summary-card pending">
          <h3>{summary.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="summary-card remaining">
          <h3>{summary.remaining}</h3>
          <p>Remaining</p>
        </div>
      </div>

      {/* Breakdown Section */}
      <h3 className="section-title">Leave Balance Breakdown</h3>
      <div className="breakdown-grid">
        <div className="breakdown-card">
          <h4>Annual Leave</h4>
          <p>{balances.Annual} taken</p>
        </div>
        <div className="breakdown-card">
          <h4>Sick Leave</h4>
          <p>{balances.Sick} taken</p>
        </div>
        <div className="breakdown-card">
          <h4>Personal Leave</h4>
          <p>{balances.Personal} taken</p>
        </div>
      </div>

      {/* Leave History */}
      <h3 className="section-title">Leave History</h3>
      <div className="request-grid">
        {requests.map(req => (
          <div key={req._id} className="request-card">
            <div className="req-header">
              <h4>{req.leaveType}</h4>
              <span className={`status ${req.status.toLowerCase()}`}>
                {req.status}
              </span>
            </div>
            <p>
              {req.startDate ? new Date(req.startDate).toLocaleDateString() : "-"} - 
              {req.endDate ? new Date(req.endDate).toLocaleDateString() : "-"}
            </p>
            <p><strong>Reason:</strong> {req.reason}</p>
            {req.status === "Pending" && (
              <button className="delete-btn" onClick={() => handleDelete(req._id)}>Delete</button>
            )}
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <button className="new-leave-fab" onClick={() => setShowForm(true)}>+ New Leave</button>

      {/* Modal */}
      {showForm && (
        <div className="leave-form-modal">
          <div className="leave-form">
            <h3>Request Leave</h3>
            <label>Type:
              <select value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Personal">Personal Leave</option>
              </select>
            </label>
            <label>From:
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </label>
            <label>To:
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </label>
            <label>Reason:
              <textarea value={reason} onChange={e => setReason(e.target.value)} />
            </label>
            <div className="form-actions">
              <button onClick={handleSubmit}>Submit</button>
              <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
