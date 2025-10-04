import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDocuments.css";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [declineReason, setDeclineReason] = useState("");
  const [activeDeclineId, setActiveDeclineId] = useState(null);

  // ✅ Get JWT token from localStorage (set it on login)
  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/documents/all",
        axiosConfig
      );
      setDocuments(res.data);
    } catch (err) {
      console.error(
        "Error fetching documents:",
        err.response?.data || err.message
      );
      alert(err.response?.data?.message || "Failed to fetch documents");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDownload = (path, name) => {
    const link = document.createElement("a");
    link.href = `http://localhost:5000/${path}`;
    link.target = "_blank";
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleAccept = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/documents/${id}/status`,
        { status: "Accepted" },
        axiosConfig
      );
      fetchDocuments();
    } catch (err) {
      console.error("Accept failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Accept failed");
    }
  };

  const handleDecline = async (id) => {
    if (!declineReason) return alert("Please enter a decline reason");
    try {
      await axios.patch(
        `http://localhost:5000/api/documents/${id}/status`,
        { status: "Declined", message: declineReason },
        axiosConfig
      );
      setDeclineReason("");
      setActiveDeclineId(null);
      fetchDocuments();
    } catch (err) {
      console.error("Decline failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Decline failed");
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.category?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statuses = [
    "Processing",
    "Pending",
    "Submitted",
    "Under Review",
    "Accepted",
    "Declined",
  ];
  const counts = {};
  statuses.forEach(
    (status) => (counts[status] = documents.filter((d) => d.status === status).length)
  );

  return (
    <div className="admin-doc-container">
      <h1>Document Management</h1>
      <p>Request, review, and manage employee documents and submissions.</p>

      <div className="summary-grid">
        {statuses.map((status) => (
          <div
            key={status}
            className={`summary-card ${status.toLowerCase().replace(/ /g, "-")}`}
          >
            <h3>{counts[status]}</h3>
            <p>{status}</p>
          </div>
        ))}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by employee, title, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="doc-list">
        {filteredDocuments.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc._id} className="doc-card">
              <div className="doc-info">
                <div className="avatar">
                  {doc.employeeName?.charAt(0).toUpperCase() || "E"}
                </div>
                <div>
                  <h4>{doc.name}</h4>
                  <p>Employee: {doc.employeeName || doc.employeeId}</p>
                  <p>Category: {doc.category}</p>
                  <p>Status: {doc.status}</p>
                  {doc.status === "Declined" && doc.message && (
                    <p className="decline-msg">Reason: {doc.message}</p>
                  )}
                  <p>
                    Uploaded:{" "}
                    {doc.uploaded
                      ? new Date(doc.uploaded).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>Size: {doc.size}</p>
                </div>
              </div>

              <div className="doc-actions">
                <button onClick={() => handleDownload(doc.path, doc.name)}>
                  Download
                </button>

                {doc.status !== "Accepted" && doc.status !== "Declined" && (
                  <>
                    <button onClick={() => handleAccept(doc._id)}>Accept</button>
                    {activeDeclineId === doc._id ? (
                      <>
                        <input
                          type="text"
                          placeholder="Enter decline reason..."
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                        />
                        <button onClick={() => handleDecline(doc._id)}>
                          Submit Decline
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setActiveDeclineId(doc._id)}>
                        Decline
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
