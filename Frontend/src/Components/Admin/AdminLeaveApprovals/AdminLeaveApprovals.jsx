import React, { useState, useEffect } from "react";
import "./AdminLeaveApprovals.css";

const AdminLeaveApprovals = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeaves() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await fetch("/api/admin/leaves", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const text = await res.text();
        let data = [];
        try { data = JSON.parse(text); } catch { console.error("Invalid JSON:", text); }

        if (!res.ok) throw new Error(data.error || "Failed to fetch leaves");
        setLeaveRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading leaves:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadLeaves();
  }, []);

  const handleDecision = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`/api/admin/leaves/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminRemark: "OK" }),
      });

      const text = await res.text();
      let updated = {};
      try { updated = JSON.parse(text); } catch { console.error("Invalid JSON:", text); }

      if (!res.ok) throw new Error(updated.error || "Failed to update leave");

      setLeaveRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
    } catch (err) {
      console.error("Error updating leave:", err.message);
    }
  };

  const filteredRequests = leaveRequests.filter(
    req => filter === "All" ? true : req.status === filter
  );

  const summary = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === "Pending").length,
    approved: leaveRequests.filter(r => r.status === "Approved").length,
    rejected: leaveRequests.filter(r => r.status === "Rejected").length,
  };

  if (loading) return <div className="leave-approvals-container"><p>Loading leave requests...</p></div>;
  if (error) return <div className="leave-approvals-container"><p className="error">{error}</p></div>;

  return (
    <div className="leave-approvals-container">
      <h2>Leave Request Approvals</h2>
      <p className="subtitle">Review and approve employee leave requests.</p>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h4>Total Requests</h4>
          <p className="number">{summary.total}</p>
          <small>All time</small>
        </div>
        <div className="card">
          <h4>Pending</h4>
          <p className="number pending">{summary.pending}</p>
          <small>Awaiting approval</small>
        </div>
        <div className="card">
          <h4>Approved</h4>
          <p className="number approved">{summary.approved}</p>
          <small>This month</small>
        </div>
        <div className="card">
          <h4>Rejected</h4>
          <p className="number rejected">{summary.rejected}</p>
          <small>This month</small>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-buttons">
        {["All","Pending","Approved","Rejected"].map(f => (
          <button
            key={f}
            className={filter===f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f} ({leaveRequests.filter(r=>f==="All"?true:r.status===f).length})
          </button>
        ))}
      </div>

      {/* Leave Requests */}
      <div className="leave-requests-list">
        {filteredRequests.length === 0 ? (
          <p>No leave requests found.</p>
        ) : (
          filteredRequests.map(req => (
            <div className="leave-request-card" key={req._id}>
              <div className="leave-header">
                <div className="employee-info">
                  <div className="avatar">{req.name[0]}</div>
                  <div>
                    <h4>{req.name}</h4>
                    <small>{req.employeeId} • {req.department}</small>
                  </div>
                </div>
                <div className={`status ${req.status.toLowerCase()}`}>{req.status}</div>
              </div>

              <div className="leave-details">
                <p><strong>Leave Type:</strong> {req.leaveType}</p>
                <p><strong>Duration:</strong> {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                <p><strong>Applied Date:</strong> {new Date(req.appliedDate).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> {req.reason}</p>
              </div>

              {req.status === "Pending" && (
                <div className="leave-actions">
                  <button className="review">Review</button>
                  <button className="approve" onClick={() => handleDecision(req._id, "Approved")}>Approve</button>
                  <button className="reject" onClick={() => handleDecision(req._id, "Rejected")}>Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLeaveApprovals;
