import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { FaUser, FaUserShield, FaUsers } from "react-icons/fa";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import axios from "axios";

const portals = [
  { id: "admin", title: "Admin", subtitle: "Manage employees & approvals", icon: <MdOutlineAdminPanelSettings /> },
  { id: "employee", title: "Employee", subtitle: "Personal dashboard & tasks", icon: <FaUser /> },
  { id: "superadmin", title: "Super Admin", subtitle: "Organization control", icon: <FaUserShield /> },
  { id: "client", title: "Client", subtitle: "Project status & reports", icon: <FaUsers /> },
];

const roleMap = { admin: "Admin", superadmin: "SuperAdmin", client: "Client" };

export default function LoginPage() {
  const [selectedPortal, setSelectedPortal] = useState("employee");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const selectPortal = (id) => {
    setSelectedPortal(id);
    setIdentifier("");
    setPassword("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;

      if (selectedPortal === "employee") {
        // Employee login with employeeId + password
        res = await axios.post("http://localhost:5000/api/employees/login", {
          employeeId: identifier,
          password,
        });

        // Store token and employee info in localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("employeeId", res.data.employeeId);

        navigate("/employee/dashboard");
      } else {
        // Admin / SuperAdmin / Client login with email + password
        res = await axios.post("http://localhost:5000/api/auth/login", {
          email: identifier,
          password,
          role: roleMap[selectedPortal],
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("department", res.data.department);

        const role = res.data.role?.toLowerCase();
        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "superadmin") navigate("/superadmin/dashboard");
        else if (role === "client") navigate("/client/dashboard");
        else navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const currentPortal = portals.find((p) => p.id === selectedPortal);

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* LEFT — Portal selector */}
        <aside className="portal-section">
          <div className="brand">
            <div className="logo">SP</div>
            <div>
              <h1>SaaSPlatform</h1>
              <p>Enterprise tools · Secure · Fast</p>
            </div>
          </div>

          <h2>Sign in to your portal</h2>

          <div className="portal-grid">
            {portals.map((p) => (
              <div
                key={p.id}
                className={`portal-card ${selectedPortal === p.id ? "active" : ""}`}
                onClick={() => selectPortal(p.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && selectPortal(p.id)}
                aria-pressed={selectedPortal === p.id}
              >
                <div className="icon">{p.icon}</div>
                <div className="meta">
                  <h4>{p.title}</h4>
                  <p>{p.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, color: "#6b7280", fontSize: 13 }}>
            Tip: choose the portal on left — the form on the right will adapt.
          </div>
        </aside>

        {/* RIGHT — Login form */}
        <main className="form-section">
          <div className="form-card">
            <h3>{currentPortal.title} Login</h3>
            <p className="subtitle">Secure sign-in for {currentPortal.title.toLowerCase()}</p>

            <form onSubmit={handleLogin} aria-label={`${currentPortal.title} login form`}>
              <div className="form-group">
                <label>{selectedPortal === "employee" ? "Employee ID" : "Email address"}</label>
                <input
                  type={selectedPortal === "employee" ? "text" : "email"}
                  name={selectedPortal === "employee" ? "employeeId" : "email"} // added name
                  placeholder={selectedPortal === "employee" ? "EMP-123456" : "name@company.com"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete={selectedPortal === "employee" ? "username" : "username"} // browser autocomplete
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password" // added name
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password" // browser autocomplete
                />
              </div>

              {/* Demo Login Button */}
              {selectedPortal !== "employee" && (
                <div style={{ marginBottom: "12px" }}>
                  <button
                    type="button"
                    className="btn-demo"
                    onClick={() => {
                      if (selectedPortal === "admin") {
                        setIdentifier("admin@company.com");
                        setPassword("Admin@123");
                      } else if (selectedPortal === "superadmin") {
                        setIdentifier("superadmin@company.com");
                        setPassword("SuperAdmin@123");
                      } else if (selectedPortal === "client") {
                        setIdentifier("client@company.com");
                        setPassword("Client@123");
                      }
                    }}
                  >
                    Demo Login
                  </button>
                </div>
              )}

              <div className="actions">
                <button className="btn-submit" type="submit" disabled={loading}>
                  {loading ? "Signing in…" : `Sign in as ${currentPortal.title}`}
                </button>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <a className="link-muted" href="#forgot">
                  Forgot password?
                </a>
                <a className="link-muted" href="#help">
                  Need help?
                </a>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
