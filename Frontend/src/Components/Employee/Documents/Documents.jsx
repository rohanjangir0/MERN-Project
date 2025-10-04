import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Documents.css";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");

  // Get JWT token from localStorage (assumes login saved it)
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) fetchDocuments();
  }, [token]);

  // Fetch documents for logged-in employee
  const fetchDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/documents/employee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(res.data);
    } catch (err) {
      console.error("❌ Fetch documents error:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Failed to fetch documents");
    }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUploadSubmit = async () => {
    if (!selectedFile) return alert("Please select a file first");
    if (!token) return alert("You are not logged in");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("category", description || "Uncategorized");
    formData.append("description", description);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/documents/upload",
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      console.log("✅ Upload success:", res.data);
      setSelectedFile(null);
      setDescription("");
      fetchDocuments();
    } catch (err) {
      console.error("❌ Upload failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Upload failed");
    }
  };

  const handleDownload = (path, name) => {
    const link = document.createElement("a");
    link.href = `http://localhost:5000/${path}`;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // Document stats
  const totalDocs = documents.length;
  const pendingDocs = documents.filter((d) => d.status === "Processing").length;
  const acceptedDocs = documents.filter((d) => d.status === "Accepted").length;
  const declinedDocs = documents.filter((d) => d.status === "Declined").length;

  return (
    <div className="doc-container">
      <div className="doc-stats">
        <div className="stat-card total">
          <h3>{totalDocs}</h3>
          <p>Total Documents</p>
        </div>
        <div className="stat-card pending">
          <h3>{pendingDocs}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card accepted">
          <h3>{acceptedDocs}</h3>
          <p>Accepted</p>
        </div>
        <div className="stat-card declined">
          <h3>{declinedDocs}</h3>
          <p>Declined</p>
        </div>
      </div>

      <div className="doc-upload">
        <h2>Upload New Document</h2>
        <input type="file" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Add a description or category..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="submit-btn" onClick={handleUploadSubmit}>
          Submit
        </button>
      </div>

      <div className="doc-list">
        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className={`doc-card ${doc.status.toLowerCase()}`}>
              <div className="doc-info">
                <h4>{doc.name}</h4>
                <p>
                  {doc.category} • {doc.size} • Uploaded {new Date(doc.uploaded).toLocaleDateString()}
                </p>
                <span className={`status-badge ${doc.status.toLowerCase()}`}>
                  {doc.status}
                </span>
              </div>
              <div className="doc-actions">
                <button onClick={() => handleDownload(doc.path, doc.name)}>👁 Download</button>
                <button className="delete" onClick={() => handleDelete(doc._id)}>🗑 Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Documents;
