import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EmployeeManagement.css";
import { FaUserPlus, FaTrash, FaEdit, FaClipboard } from "react-icons/fa";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    status: "Active",
    password: "",
  });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSave = async () => {
    try {
      if (editingEmployee) {
        const res = await axios.put(
          `http://localhost:5000/api/employees/${editingEmployee._id}`,
          formData
        );
        setEmployees(
          employees.map((emp) =>
            emp._id === editingEmployee._id ? res.data : emp
          )
        );
        setEditingEmployee(null);
      } else {
        if (!formData.password) {
          alert("Password is required for new employee");
          return;
        }
        const res = await axios.post(
          "http://localhost:5000/api/employees/add",
          formData
        );
        setEmployees([...employees, res.data.employee]);
      }
      setFormData({
        name: "",
        email: "",
        phone: "",
        department: "",
        status: "Active",
        password: "",
      });
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      setEmployees(employees.filter((emp) => emp._id !== id));
    } catch (err) {
      alert("Failed to delete employee");
    }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      status: emp.status,
      password: "",
    });
    setShowModal(true);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "Active").length;
  const onLeave = employees.filter((e) => e.status === "On Leave").length;
  const avgPerformance = 85;
  const avgAttendance = 92;

  return (
    <div className="emp-management">
      <h1>Employee Management</h1>
      <p>Manage your workforce efficiently with modern tools.</p>

      <div className="emp-metrics-container">
        <div className="emp-metrics-card gradient-blue">
          <h3>Total Employees</h3>
          <h2>{totalEmployees}</h2>
        </div>
        <div className="emp-metrics-card gradient-green">
          <h3>Active</h3>
          <h2>{activeEmployees}</h2>
        </div>
        <div className="emp-metrics-card gradient-yellow">
          <h3>On Leave</h3>
          <h2>{onLeave}</h2>
        </div>
        <div className="emp-metrics-card gradient-purple">
          <h3>Avg Performance</h3>
          <h2>{avgPerformance}%</h2>
        </div>
        <div className="emp-metrics-card gradient-pink">
          <h3>Avg Attendance</h3>
          <h2>{avgAttendance}%</h2>
        </div>
      </div>

      <div className="emp-toolbar">
        <button onClick={() => setShowModal(true)} className="emp-add-btn">
          <FaUserPlus /> Add Employee
        </button>
      </div>

      <div className="emp-directory">
        {employees.map((emp) => (
          <div key={emp._id} className="emp-card">
            <h3>{emp.name}</h3>
            <p>{emp.department}</p>
            <p>{emp.email} | {emp.phone}</p>
            <p><strong>ID:</strong> {emp.employeeId}</p>
            <p><strong>Joined:</strong> {new Date(emp.joinDate).toLocaleDateString()}</p>
            <p>
              <strong>Password:</strong> Hidden
              {emp.password && (
                <button onClick={() => copyToClipboard(emp.password)}>
                  <FaClipboard />
                </button>
              )}
            </p>
            <p><strong>Status:</strong> {emp.status}</p>
            <div className="emp-actions">
              <button className="emp-edit-btn" onClick={() => handleEdit(emp)}>
                <FaEdit /> Edit
              </button>
              <button className="emp-delete-btn" onClick={() => handleDelete(emp._id)}>
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal">
            <h2>{editingEmployee ? "Edit Employee" : "Add Employee"}</h2>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            {!editingEmployee && (
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="emp-modal-actions">
              <button onClick={handleSave} className="emp-save-btn">
                {editingEmployee ? "Update" : "Save"}
              </button>
              <button onClick={() => setShowModal(false)} className="emp-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
