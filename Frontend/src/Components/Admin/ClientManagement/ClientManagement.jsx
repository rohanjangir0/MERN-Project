import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClientManagement.css";

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editClientId, setEditClientId] = useState(null);
  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    industry: "",
    gst: "",
    notes: "",
    status: "active",
  });

  // NEW: store one-time credentials to show after creation
  const [oneTimeCred, setOneTimeCred] = useState(null);
  const [showCredModal, setShowCredModal] = useState(false);

  const token = localStorage.getItem("token"); // JWT token

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      if (!token) {
        alert("No token found! Please login.");
        return;
      }
      const res = await axios.get("http://localhost:5000/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
      alert("Failed to load clients from server.");
    }
  };

  const handleInput = (e) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  const generatePassword = () => Math.random().toString(36).slice(-8) + "A1!";
  const generateLoginId = (name) => {
    const namePart = (name || "").toLowerCase().replace(/\s+/g, "").slice(0, 3) || "cli";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${namePart}${randomNum}`;
  };

  // Add or Update client dynamically
  const addClient = async () => {
    if (!newClient.name || !newClient.company) return;

    try {
      if (!token) {
        alert("No token found! Please login.");
        return;
      }

      if (editClientId) {
        // Update client
        await axios.put(`http://localhost:5000/api/clients/${editClientId}`, newClient, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new client
        const clientPassword = generatePassword();
        const clientLoginId = generateLoginId(newClient.name);

        const clientData = {
          ...newClient,
          password: clientPassword, // frontend-generated temporary password
          loginId: clientLoginId,
          value: 0,
          projects: 0,
          lastActivity: new Date().toISOString().split("T")[0],
        };

        // POST to backend - backend may return created client and/or temp password
        const res = await axios.post("http://localhost:5000/api/clients", clientData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Determine loginId & tempPassword to show — prefer server response if present
        const returned = res.data || {};
        const loginIdToShow = returned.loginId || returned.login || clientData.loginId || "";
        const passwordToShow = returned.tempPassword || returned.password || clientData.password || "";

        // Save one-time credentials to show in modal
        setOneTimeCred({ loginId: loginIdToShow, password: passwordToShow, name: clientData.name });
        setShowCredModal(true);
      }

      // Refresh client list
      await fetchClients();

      // Reset modal/form
      setShowModal(false);
      setEditClientId(null);
      setNewClient({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        zip: "",
        industry: "",
        gst: "",
        notes: "",
        status: "active",
      });
    } catch (err) {
      console.error("Error saving client:", err);
      alert("Failed to save client.");
    }
  };

  const editClient = (client) => {
    setNewClient(client);
    setEditClientId(client._id || client.id);
    setShowModal(true);
  };

  const deleteClient = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/clients/${_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(clients.filter((c) => (c._id || c.id) !== _id));
    } catch (err) {
      console.error("Error deleting client:", err);
      alert("Failed to delete client.");
    }
  };

  // Helper to copy credentials
  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).then(() => {
      alert("Copied to clipboard");
    });
  };

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const totalValue = clients.reduce((sum, c) => sum + (c.value || 0), 0);
  const avgValue = (totalClients ? totalValue / totalClients : 0).toFixed(2);

  return (
    <div className="client-management">
      <div className="header-actions">
        <h1>Client Management</h1>
        <button className="add-client-btn" onClick={() => setShowModal(true)}>
          Add Client
        </button>
      </div>

      {/* Add/Edit Client Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{editClientId ? "Edit Client" : "Add New Client"}</h2>
            <p>Create a new client profile with contact and business information.</p>
            <div className="modal-form">
              {["name", "company", "email", "phone", "address", "city", "state", "zip", "gst", "notes"].map(
                (field) => (
                  <input
                    key={field}
                    name={field}
                    value={newClient[field]}
                    onChange={handleInput}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  />
                )
              )}
              <select name="country" value={newClient.country} onChange={handleInput}>
                <option value="">Select country</option>
                <option value="USA">USA</option>
                <option value="India">India</option>
                <option value="UK">UK</option>
              </select>
              <select name="industry" value={newClient.industry} onChange={handleInput}>
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="create-btn" onClick={addClient}>
                {editClientId ? "Update Client" : "Create Client"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONE-TIME CREDENTIALS MODAL (appears after create) */}
      {showCredModal && oneTimeCred && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Client Credentials (Show once)</h2>
            <p>
              Copy these credentials and share them securely with the client. This password is a one-time
              temporary password — the client should change it on first login.
            </p>
            <div style={{ margin: "12px 0", lineHeight: 1.6 }}>
              <div><strong>Name:</strong> {oneTimeCred.name}</div>
              <div><strong>Login ID:</strong> {oneTimeCred.loginId}</div>
              <div>
                <strong>Temp Password:</strong> {oneTimeCred.password}
              </div>
              <div style={{ marginTop: 10 }}>
                <button onClick={() => copyToClipboard(oneTimeCred.loginId)}>Copy Login ID</button>
                <button onClick={() => copyToClipboard(oneTimeCred.password)} style={{ marginLeft: 8 }}>
                  Copy Password
                </button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="create-btn" onClick={() => { setShowCredModal(false); setOneTimeCred(null); }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bento Grid Stats */}
      <div className="bento-grid">
        <div className="bento-card teal">
          <h3>Total Clients</h3>
          <h2>{totalClients}</h2>
          <p>+12% this month</p>
        </div>
        <div className="bento-card green">
          <h3>Active Clients</h3>
          <h2>{activeClients}</h2>
          <p>{totalClients ? ((activeClients / totalClients) * 100).toFixed(0) : 0}% active</p>
        </div>
        <div className="bento-card orange">
          <h3>Total Revenue</h3>
          <h2>${totalValue.toLocaleString()}</h2>
          <p>+18% growth</p>
        </div>
        <div className="bento-card purple">
          <h3>Avg Project Value</h3>
          <h2>${avgValue}</h2>
          <p>+5% increase</p>
        </div>
        {clients[0] && (
          <div className="bento-card blue wide">
            <h3>Top Client</h3>
            <p>
              {clients[0].name} ({clients[0].company})
            </p>
            <h2>${(clients[0].value || 0).toLocaleString()}</h2>
          </div>
        )}
      </div>

      {/* Recent Client Activity */}
      <div className="section-box">
        <h2>Recent Client Activity</h2>
        <div className="recent-carousel">
          {clients.map((client) => (
            <div key={client._id || client.id} className="recent-card">
              <div className="avatar">{(client.name || "").split(" ").map((n) => n[0]).join("")}</div>
              <h3>{client.name}</h3>
              <p className="company">{client.company}</p>
              <span className={`status ${client.status}`}>{client.status}</span>
              <p className="meta">
                {client.projects || 0} projects • ${(client.value || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* All Clients */}
      <div className="section-box">
        <h2>All Clients</h2>
        <div className="client-list">
          {clients.map((client) => (
            <div key={client._id || client.id} className="client-card">
              <div className="avatar">{(client.name || "").split(" ").map((n) => n[0]).join("")}</div>
              <div className="client-details">
                <h3>{client.name}</h3>
                <p>{client.company}</p>
                <p>{client.email}</p>
                <p>
                  {client.address}, {client.city}, {client.state}, {client.country}
                </p>
                <p>ID: {client.loginId}</p>
                {/* Do not show persistent passwords in the list for security */}
              </div>
              <div className="client-meta">
                <span className={`status ${client.status}`}>{client.status}</span>
                <span className="industry">{client.industry}</span>
              </div>
              <div className="client-actions">
                <button title="Edit" onClick={() => editClient(client)}>
                  &#xE3C9;
                </button>
                <button title="Delete" onClick={() => deleteClient(client._id || client.id)}>
                  &#xE872;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientManagement;
