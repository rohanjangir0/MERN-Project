import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminTickets.css";

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTickets();
    fetchEmployees();
    fetchProjects();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects");
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, { status });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignEmployee = async (ticketId, employeeId) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, { assignedTo: employeeId });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    (filterStatus === "" || ticket.status === filterStatus) &&
    ticket.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-container">
      <h2>Admin Ticket Dashboard</h2>

      {/* Controls */}
      <div className="controls">
        <input 
          type="text" 
          placeholder="Search tickets..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Ticket Cards */}
      <div className="tickets-grid">
        {filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <div className="ticket-card" key={ticket._id}>
              <div className="ticket-header">
                <h3>{ticket.title}</h3>
                <span className={`status-badge ${ticket.status.toLowerCase().replace(" ", "-")}`}>
                  {ticket.status}
                </span>
              </div>

              <div className="ticket-info">
                <p><strong>Client:</strong> {ticket.clientName}</p>
                <p><strong>Project:</strong> {projects.find(p => p._id === ticket.projectId)?.projectTitle || "N/A"}</p>
                <p><strong>Assigned To:</strong> {employees.find(e => e._id === ticket.assignedTo)?.name || "Unassigned"}</p>
              </div>

              <div className="ticket-actions">
                <select
                  value={ticket.assignedTo || ""}
                  onChange={e => handleAssignEmployee(ticket._id, e.target.value)}
                >
                  <option value="">-- Assign Employee --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>

                <div className="status-buttons">
                  {ticket.status !== "In Progress" && (
                    <button className="btn-progress" onClick={() => handleStatusChange(ticket._id, "In Progress")}>In Progress</button>
                  )}
                  {ticket.status !== "Resolved" && (
                    <button className="btn-resolve" onClick={() => handleStatusChange(ticket._id, "Resolved")}>Resolve</button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-tickets">No tickets found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;
