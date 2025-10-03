import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./ClientProposals.css";

const ClientProposals = () => {
  const [requests, setRequests] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();

    // 🔄 Auto-refresh every 5 seconds
    const interval = setInterval(fetchProjects, 5000);

    return () => clearInterval(interval); // cleanup when component unmounts
  }, []);

  const fetchProjects = async () => {
    try {
      // ✅ no "/api" here because baseURL already has /api
      const res = await axios.get("/projects");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const exportPDF = (project) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(project.projectTitle, 14, 20);

    doc.setFontSize(12);
    doc.text(`Client: ${project.client || "N/A"}`, 14, 30);
    doc.text(`Category: ${project.category}`, 14, 40);
    doc.text(
      `Budget: $${(project.negotiatedBudget || project.budget).toLocaleString()}`,
      14,
      50
    );
    doc.text(`Timeline: ${project.timeline}`, 14, 60);

    doc.autoTable({
      startY: 70,
      head: [["Feature", "Details"]],
      body: [
        ["Priority", project.priority || "low"],
        ["Team Size", project.teamSize || "N/A"],
        ["Core Features", project.coreFeatures?.join(", ") || "N/A"],
        ["Integrations", project.integrations?.join(", ") || "N/A"],
        ["Platforms", project.platforms?.join(", ") || "N/A"],
        ["Support Level", project.supportLevel || "N/A"],
        ["Notes", project.additionalNotes || "None"],
        ["Status", project.status],
        ["Deal Done", project.dealDone ? "Yes" : "No"],
      ],
    });

    doc.save(`${project.projectTitle}.pdf`);
  };

  const handleNegotiate = async (id) => {
    const newBudget = prompt("Enter negotiated budget:");
    if (newBudget) {
      await axios.put(`/projects/${id}`, { negotiatedBudget: newBudget });
      fetchProjects();
    }
  };

  const handleDealDone = async (id) => {
    await axios.put(`/projects/${id}`, { dealDone: true, status: "done" });
    fetchProjects();
  };

  const totalRequests = requests.length;
  const pendingReview = requests.filter((r) => r.status === "pending").length;
  const totalValue = requests.reduce((acc, r) => acc + (r.budget || 0), 0);
  const avgResponseTime = "2.4h";

  return (
    <div className="client-proposals">
      {/* Top Stats */}
      <div className="stats">
        <div className="stat-card blue">
          <h3>{totalRequests}</h3>
          <p>Total Requests</p>
        </div>
        <div className="stat-card orange">
          <h3>{pendingReview}</h3>
          <p>Pending Review</p>
        </div>
        <div className="stat-card green">
          <h3>${totalValue.toLocaleString()}</h3>
          <p>Estimated Value</p>
        </div>
        <div className="stat-card purple">
          <h3>{avgResponseTime}</h3>
          <p>Avg. Response Time</p>
        </div>
      </div>

      {/* High Priority Section */}
      <div className="high-priority">
        <h4>🚨 High Priority Requests</h4>
        {requests
          .filter((r) => r.priority === "high")
          .map((r) => (
            <div className="priority-card" key={r._id}>
              <h5>{r.projectTitle}</h5>
              <p>{r.category}</p>
              <span className={`status ${r.status}`}>{r.status}</span>
              <span className="budget">
                ${(r.negotiatedBudget || r.budget).toLocaleString()}
              </span>
            </div>
          ))}
      </div>

      {/* Client Proposal Requests */}
      <div className="client-requests">
        <h4>Client Proposal Requests</h4>
        <div className="request-list">
          {requests.map((r) => (
            <div className="request-card" key={r._id}>
              <h5>{r.projectTitle}</h5>
              <p className="category">{r.category}</p>
              <p className="description">
                Budget:{" "}
                <span className="budget">
                  ${(r.negotiatedBudget || r.budget).toLocaleString()}
                </span>{" "}
                | Timeline: {r.timeline}
              </p>
              <p className="submitted">
                Submitted {new Date(r.createdAt).toLocaleDateString()}
              </p>
              <div className="actions">
                <button className="btn" onClick={() => setSelectedProject(r)}>
                  View Details
                </button>
                <button
                  className="btn estimate"
                  onClick={() => handleNegotiate(r._id)}
                >
                  Negotiate Price
                </button>
                {!r.dealDone && (
                  <button
                    className="btn success"
                    onClick={() => handleDealDone(r._id)}
                  >
                    Mark Deal Done
                  </button>
                )}
                <button className="btn export" onClick={() => exportPDF(r)}>
                  Export PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for View Details */}
      {selectedProject && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedProject(null)}>
              &times;
            </span>
            <h3>{selectedProject.projectTitle}</h3>
            <p><strong>Client:</strong> {selectedProject.client}</p>
            <p><strong>Category:</strong> {selectedProject.category}</p>
            <p>
              <strong>Budget:</strong> $
              {(selectedProject.negotiatedBudget || selectedProject.budget).toLocaleString()}
            </p>
            <p><strong>Timeline:</strong> {selectedProject.timeline}</p>
            <p><strong>Priority:</strong> {selectedProject.priority}</p>
            <p><strong>Status:</strong> {selectedProject.status}</p>
            <p><strong>Deal Done:</strong> {selectedProject.dealDone ? "Yes" : "No"}</p>
            <p><strong>Team Size:</strong> {selectedProject.teamSize || "N/A"}</p>
            <p><strong>Core Features:</strong> {selectedProject.coreFeatures?.join(", ") || "N/A"}</p>
            <p><strong>Integrations:</strong> {selectedProject.integrations?.join(", ") || "N/A"}</p>
            <p><strong>Platforms:</strong> {selectedProject.platforms?.join(", ") || "N/A"}</p>
            <p><strong>Support Level:</strong> {selectedProject.supportLevel || "N/A"}</p>
            <p><strong>Notes:</strong> {selectedProject.additionalNotes || "None"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProposals;
