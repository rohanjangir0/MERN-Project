import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [mode, setMode] = useState("login"); // login | forgot | reset
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState(""); // token from URL
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const currentPortal = portals.find((p) => p.id === selectedPortal);

  // 🔹 Auto-detect reset token from URL
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (pathParts[1] === "reset-password") {
      const tokenFromURL = pathParts[2] || "";
      if (tokenFromURL) {
        setResetToken(tokenFromURL);
        setMode("reset");
      }
    }
  }, [location.pathname]);

  const selectPortal = (id) => {
    setSelectedPortal(id);
    setIdentifier("");
    setPassword("");
    setMode("login");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (selectedPortal === "employee") {
        res = await axios.post("http://localhost:5000/api/employees/login", {
          employeeId: identifier,
          password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("employeeId", res.data.employeeId);
        navigate("/employee/dashboard");
      } else {
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
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/employees/forgot-password", {
        email: resetEmail,
      });
      alert("Password reset link sent to your email");
      setMode("login");
      setResetEmail("");
    } catch (err) {
      alert(err.response?.data?.error || "Error sending reset email");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/employees/reset-password/${resetToken}`, {
        newPassword,
      });
      alert("Password updated successfully!");
      setMode("login");
      setNewPassword("");
      setResetToken("");
    } catch (err) {
      alert(err.response?.data?.error || "Error resetting password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* LEFT */}
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
              >
                <div className="icon">{p.icon}</div>
                <div className="meta">
                  <h4>{p.title}</h4>
                  <p>{p.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT */}
        <main className="form-section">
          <div className="form-card">
            {/* LOGIN FORM */}
            {mode === "login" && (
              <>
                <h3>{currentPortal.title} Login</h3>
                <p className="subtitle">Secure sign-in for {currentPortal.title.toLowerCase()}</p>
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>{selectedPortal === "employee" ? "Employee ID" : "Email address"}</label>
                    <input
                      type={selectedPortal === "employee" ? "text" : "email"}
                      placeholder={selectedPortal === "employee" ? "EMP-123456" : "name@company.com"}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Demo Login */}
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

                  <div className="form-links">
                    <button type="button" className="link-muted" onClick={() => setMode("forgot")}>
                      Forgot password?
                    </button>
                    <a className="link-muted" href="#help">
                      Need help?
                    </a>
                  </div>
                </form>
              </>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === "forgot" && (
              <>
                <h3>Forgot Password</h3>
                <p className="subtitle">Enter your registered email to reset password</p>
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="actions">
                    <button className="btn-submit" type="submit">
                      Send Reset Link
                    </button>
                  </div>
                  <div className="form-links">
                    <button type="button" className="link-muted" onClick={() => setMode("login")}>
                      Back to login
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* RESET PASSWORD FORM */}
            {mode === "reset" && (
              <>
                <h3>Reset Password</h3>
                <p className="subtitle">Enter your new password</p>
                <form onSubmit={handleResetPassword}>
                  {!resetToken && (
                    <div className="form-group">
                      <label>Reset Token</label>
                      <input
                        type="text"
                        placeholder="Paste the token from email"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="actions">
                    <button className="btn-submit" type="submit">
                      Reset Password
                    </button>
                  </div>
                  <div className="form-links">
                    <button type="button" className="link-muted" onClick={() => setMode("login")}>
                      Back to login
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
