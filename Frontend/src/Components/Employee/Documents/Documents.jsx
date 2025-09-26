import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Documents.css";

const Documents = ({ employeeId }) => {
  const [documents, setDocuments] = useState([]);

  // Fetch documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/documents/employee/${employeeId}`);
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // must match multer.single("file")
    formData.append("employeeId", employeeId); // pass employeeId
    formData.append("category", "Uncategorized");

    try {
      await axios.post("http://localhost:5000/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchDocuments(); // refresh after upload
    } catch (err) {
      console.error(err);
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
      await axios.delete(`http://localhost:5000/api/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="doc-container">
      <div className="doc-header">
        <h2>My Documents</h2>
        <label className="upload-btn">
          + Upload Document
          <input type="file" style={{ display: "none" }} onChange={handleUpload} />
        </label>
      </div>

      <div className="doc-list">
        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className="doc-card">
              <div>
                <h4>{doc.name}</h4>
                <p>
                  {doc.category} • {doc.size} • Uploaded {new Date(doc.uploaded).toLocaleDateString()}
                </p>
              </div>
              <div className="doc-actions">
                <button onClick={() => handleDownload(doc.path, doc.name)}>👁 Download</button>
                <button
                  className="delete"
                  onClick={() => handleDelete(doc._id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Documents;
