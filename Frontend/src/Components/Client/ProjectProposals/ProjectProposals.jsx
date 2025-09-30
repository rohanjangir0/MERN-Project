import React, { useState, useEffect } from "react";
import "./ProjectProposals.css";

export default function ProjectProposals() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");

  // Mock data (replace with API later)
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        title: "E-commerce Platform for Fashion Brand",
        description: "A comprehensive e-commerce solution...",
        budget: "$75,000",
        status: "Under Review",
        date: "2024-01-15",
        timeline: "3-4 months",
        priority: "Medium",
        features: 4,
        platforms: 1,
        integrations: 2,
      },
      {
        id: 2,
        title: "Mobile App for Customer Engagement",
        description: "A mobile app to enhance engagement...",
        budget: "$45,000",
        status: "Approved",
        date: "2024-01-10",
        timeline: "2-3 months",
        priority: "High",
        features: 3,
        platforms: 2,
        integrations: 1,
      },
      {
        id: 3,
        title: "AI Chatbot for Customer Support",
        description: "AI-powered chatbot for instant support...",
        budget: "$30,000",
        status: "Submitted",
        date: "2024-01-20",
        timeline: "1-2 months",
        priority: "Low",
        features: 2,
        platforms: 1,
        integrations: 1,
      },
    ];
    setProjects(mockData);
  }, []);

  const counts = {
    All: projects.length,
    Submitted: projects.filter((p) => p.status === "Submitted").length,
    "Under Review": projects.filter((p) => p.status === "Under Review").length,
    Approved: projects.filter((p) => p.status === "Approved").length,
  };

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((p) => p.status === filter);

  return (
    <div className="project-proposals">
      <h2>Project Proposals</h2>

      {/* Filters with counts */}
      <div className="filters">
        {Object.entries(counts).map(([key, value]) => (
          <button
            key={key}
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {key} ({value})
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="project-list">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="card-header">
              <h3>{project.title}</h3>
              <span
                className={`status ${project.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {project.status}
              </span>
            </div>
            <p className="description">{project.description}</p>
            <p>
              <strong>Budget:</strong> {project.budget}
            </p>

            <div className="meta">
              <span>📅 {project.date}</span>
              <span>⏳ {project.timeline}</span>
              <span>⭐ {project.priority} priority</span>
            </div>

            <div className="stats">
              <div className="stat blue">{project.features} Features</div>
              <div className="stat green">{project.platforms} Platforms</div>
              <div className="stat purple">
                {project.integrations} Integrations
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
