import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SupportTickets.css";

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "",
    description: "",
    projectId: "", 
  });

  // Fetch tickets
  useEffect(() => {
    fetchTickets();
    fetchProjects();
  }, []);

  const fetchTickets = () => {
    axios.get("http://localhost:5000/api/tickets")
      .then((res) => setTickets(res.data))
      .catch(err => console.error(err));
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects");
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId) {
      alert("Please select a project!");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/tickets", formData);
      fetchTickets();
      setShowForm(false);
      setFormData({ title: "", category: "", priority: "", description: "", projectId: "" });
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
  }, [showForm]);

  return (
    <div className="support-container">
      <div className="header">
        <div>
          <h2>Support & Tickets</h2>
          <p>Get help with your projects and services</p>
        </div>
        <button className="submit-btn" onClick={() => setShowForm(true)}>
          + Submit Support Ticket
        </button>
      </div>

  
      <div className="stats">
        <div className="stat-card">
          <h3>{tickets.filter(t => t.status === "Open").length}</h3>
          <p>Open Tickets</p>
        </div>
        <div className="stat-card">
          <h3>{tickets.filter(t => t.status === "In Progress").length}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card">
          <h3>{tickets.filter(t => t.status === "Resolved").length}</h3>
          <p>Resolved</p>
        </div>
      </div>

    
      <div className="ticket-list">
        {tickets.map((ticket) => (
          <div className="ticket-card" key={ticket._id}>
            <div className="ticket-header">
              <h4>{ticket.title}</h4>
              <span className={`status ${ticket.status.toLowerCase().replace(" ", "-")}`}>
                {ticket.status}
              </span>
              <span className={`priority ${ticket.priority.toLowerCase()}`}>
                {ticket.priority}
              </span>
            </div>
            <p>{ticket.description}</p>
            <small>
              Project: {projects.find(p => p._id === ticket.projectId)?.projectTitle || "N/A"} • 
              Category: {ticket.category} • Submitted: {new Date(ticket.submittedAt).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>

      {/* Ticket Form Modal */}
      {showForm && (
        <div className="modal" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Submit Support Ticket</h3>
            <p>Describe your issue and we'll help you resolve it</p>
            <form onSubmit={handleSubmit}>
              <label>Select Project</label>
              <select name="projectId" value={formData.projectId} onChange={handleChange} required>
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.projectTitle}</option>
                ))}
              </select>

              <label>Brief description of the issue</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <label>Select category</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">-- Select --</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Performance</option>
              </select>

              <label>Select priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} required>
                <option value="">-- Select --</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              <label>Detailed description of the issue</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              ></textarea>

              <div className="actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
