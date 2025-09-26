import React, { useEffect, useState } from "react";
import "./AdminDocuments.css";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // ✅ Fetch documents from backend
  const fetchDocuments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/documents/all");
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // ✅ Download file (opens in new tab or saves)
  const handleDownload = (path, name) => {
    const link = document.createElement("a");
    link.href = `http://localhost:5000/${path}`;
    link.target = "_blank";
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // ✅ Apply filters
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.category?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ✅ Summary counts
  const counts = {
    processing: documents.filter((d) => d.status === "Processing").length,
    pending: documents.filter((d) => d.status === "Pending").length,
    submitted: documents.filter((d) => d.status === "Submitted").length,
    review: documents.filter((d) => d.status === "Under Review").length,
    approved: documents.filter((d) => d.status === "Approved").length,
  };

  return (
    <div className="admin-doc-container">
      <h1>Document Management</h1>
      <p>Request, review, and manage employee documents and submissions.</p>

      {/* ✅ Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card pending">
          <h3>{counts.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="summary-card submitted">
          <h3>{counts.submitted}</h3>
          <p>Submitted</p>
        </div>
        <div className="summary-card review">
          <h3>{counts.review}</h3>
          <p>Under Review</p>
        </div>
        <div className="summary-card approved">
          <h3>{counts.approved}</h3>
          <p>Approved</p>
        </div>
        <div className="summary-card processing">
          <h3>{counts.processing}</h3>
          <p>Processing</p>
        </div>
      </div>

      {/* ✅ Filters */}
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
          <option>Processing</option>
          <option>Pending</option>
          <option>Submitted</option>
          <option>Under Review</option>
          <option>Approved</option>
        </select>
      </div>

      {/* ✅ Document List */}
      <h3>Employee Documents</h3>
      <p>Manage and download all uploaded employee documents</p>

      <div className="doc-list">
        {filteredDocuments.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc._id} className="doc-card">
              <div className="doc-info">
                <div className="avatar">
                  {doc.employeeId?.charAt(0).toUpperCase() || "E"}
                </div>
                <div>
                  <h4>{doc.name}</h4>
                  <p>
                    Employee: {doc.employeeId} • {doc.category}
                  </p>
                  <p>Status: {doc.status}</p>
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
                <button>Review</button>
                <button>Message</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
