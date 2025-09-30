import React from "react";
import "./ClientDashboard.css";
import {
  FaPlus,
  FaFileAlt,
  FaComments,
  FaCalendarAlt,
  FaGlobe,
  FaMobileAlt,
  FaChartBar,
  FaPaintBrush,
  FaServer,
  FaShieldAlt,
} from "react-icons/fa";

const ClientDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Top Welcome Section */}
      <div className="welcome-card">
        <div>
          <h1>Welcome back, Emily Rodriguez! 👋</h1>
          <p>
            Ready to bring your next big idea to life? Let's build something amazing together.
          </p>
          <button className="primary-btn">
            <FaPlus /> Start New Project
          </button>
        </div>
        <div className="rocket-icon">🚀</div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Projects</h3>
          <p className="stat-value">3</p>
          <span className="stat-change">+1 this month</span>
        </div>
        <div className="stat-card">
          <h3>Total Investment</h3>
          <p className="stat-value">$125K</p>
          <span className="stat-change">+ $25K this quarter</span>
        </div>
        <div className="stat-card">
          <h3>Completion Rate</h3>
          <p className="stat-value">87%</p>
          <span className="stat-change">+5% this month</span>
        </div>
        <div className="stat-card">
          <h3>Support Tickets</h3>
          <p className="stat-value">2</p>
          <span className="stat-change">-1 resolved</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-grid">
        <div className="action-card blue">
          <FaPlus className="icon" />
          <h4>Request New Project</h4>
          <p>Start a new project request with detailed specifications</p>
        </div>
        <div className="action-card green">
          <FaFileAlt className="icon" />
          <h4>View Proposals</h4>
          <p>Check project estimates and pricing from our team</p>
        </div>
        <div className="action-card purple">
          <FaComments className="icon" />
          <h4>Team Chat</h4>
          <p>Communicate with your project team in real-time</p>
        </div>
        <div className="action-card orange">
          <FaCalendarAlt className="icon" />
          <h4>Schedule Meeting</h4>
          <p>Book a consultation with our experts</p>
        </div>
      </div>

      {/* Services + Activity */}
      <div className="bottom-section">
        {/* Services */}
        <div className="services">
          <h3>⚡ Our Services</h3>
          <p>Explore our expertise areas</p>
          <ul>
            <li>
              <FaGlobe className="icon" /> Web Development <span>12 projects completed</span>
            </li>
            <li>
              <FaMobileAlt className="icon" /> Mobile Apps <span>8 projects completed</span>
            </li>
            <li>
              <FaChartBar className="icon" /> Data Analytics <span>6 projects completed</span>
            </li>
            <li>
              <FaPaintBrush className="icon" /> UI/UX Design <span>15 projects completed</span>
            </li>
            <li>
              <FaServer className="icon" /> DevOps <span>4 projects completed</span>
            </li>
            <li>
              <FaShieldAlt className="icon" /> Security <span>3 projects completed</span>
            </li>
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="activity">
          <h3>🔔 Recent Activity</h3>
          <p>Stay updated with your project progress</p>
          <div className="activity-card urgent">
            <h4>E-commerce Platform Proposal Ready <span className="tag">Urgent</span></h4>
            <p>Your project estimate is ready for review</p>
            <span className="time">2 hours ago</span>
          </div>
          <div className="activity-card">
            <h4>New message from Development Team</h4>
            <p>Update on mobile app progress</p>
            <span className="time">4 hours ago</span>
          </div>
          <div className="activity-card">
            <h4>Payment Gateway Integration Complete</h4>
            <p>Ready for testing phase</p>
            <span className="time">1 day ago</span>
          </div>
          <div className="activity-card">
            <h4>Weekly Review Scheduled</h4>
            <p>Tomorrow at 2:00 PM</p>
            <span className="time">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
