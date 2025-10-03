import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProjectProposals.css";

export default function ProjectProposals() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects");
      // Map backend fields to match the UI
      const formattedProjects = res.data.map((p) => ({
        id: p._id,
        title: p.projectTitle,
        description: p.projectDescription,
        budget: `₹${p.budget.toLocaleString()}`,
        status: "Submitted", // You can later add real status field in DB
        date: new Date(p.createdAt).toLocaleDateString(),
        timeline: p.timeline,
        priority: p.priority,
        features: p.coreFeatures.length,
        platforms: p.platforms.length,
        integrations: p.integrations.length,
      }));
      setProjects(formattedProjects);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
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

      {/* Filters */}
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
