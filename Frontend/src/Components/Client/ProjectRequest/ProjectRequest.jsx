import React, { useState } from "react";
import axios from "axios";
import "./ProjectRequest.css";

const ProjectRequest = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectTitle: "",
    projectDescription: "",
    category: "",
    budget: 50000,
    timeline: "",
    priority: "",
    teamSize: 1,
    coreFeatures: [],
    integrations: [],
    designStyle: "",
    platforms: [],
    supportLevel: "",
    additionalNotes: "",
  });

  const categories = [
    { id: "web", title: "Web Development", icon: "🌐", color: "#2196F3" },
    { id: "mobile", title: "Mobile Apps", icon: "📱", color: "#00C853" },
    { id: "analytics", title: "Data & Analytics", icon: "📊", color: "#9C27B0" },
    { id: "uiux", title: "UI/UX Design", icon: "🎨", color: "#E91E63" },
    { id: "backend", title: "Backend Systems", icon: "🗄️", color: "#FF9800" },
    { id: "security", title: "Security Solutions", icon: "🛡️", color: "#F44336" },
  ];

  const priorities = [
    { id: "low", label: "Low Priority", badge: "Best Value", color: "#00C853" },
    { id: "medium", label: "Medium Priority", badge: "Recommended", color: "#2196F3" },
    { id: "high", label: "High Priority", badge: "Rush", color: "#FF9800" },
  ];

  const coreFeaturesList = [
    "User Authentication & Authorization",
    "Payment Gateway Integration",
    "Content Management System",
    "Email Notifications",
    "Search Functionality",
    "Admin Dashboard",
    "Real-time Updates",
    "File Upload & Storage",
  ];

  const integrationsList = [
    "Stripe/PayPal Payment Processing",
    "Google Analytics & Tag Manager",
    "Salesforce CRM Integration",
    "Mailchimp Email Marketing",
    "Slack Team Communication",
    "AWS Cloud Services",
    "Twilio SMS/Voice",
    "Social Media APIs",
  ];

  const designStyles = [
    "Modern & Minimalist",
    "Corporate & Professional",
    "Creative & Artistic",
    "Elegant & Luxury",
    "Playful & Fun",
    "Technical & Data-heavy",
  ];

  const platformsList = [
    { id: "web", label: "Web Application", icon: "🖥️" },
    { id: "mobile", label: "Mobile App", icon: "📱" },
    { id: "tablet", label: "Tablet Optimized", icon: "📱" },
    { id: "desktop", label: "Desktop Application", icon: "💻" },
  ];

  const supportLevels = [
    { id: "basic", label: "Basic Support", description: "Email support during business hours" },
    { id: "standard", label: "Standard Support", description: "Email + chat, faster response times", badge: "Popular" },
    { id: "premium", label: "Premium Support", description: "24/7 support, dedicated PM, phone support" },
  ];

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleArrayItem = (field, value) =>
    setFormData((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((i) => i !== value) : [...arr, value],
      };
    });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/projects", formData);
      alert("Project request submitted successfully!");
      setFormData({
        projectTitle: "",
        projectDescription: "",
        category: "",
        budget: 50000,
        timeline: "",
        priority: "",
        teamSize: 1,
        coreFeatures: [],
        integrations: [],
        designStyle: "",
        platforms: [],
        supportLevel: "",
        additionalNotes: "",
      });
      setStep(1);
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Try again!");
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  // Step 1 - Basics
  const renderStep1 = () => (
    <div className="step-content card">
      <h2>Project Basics</h2>
      <div className="form-group">
        <label>Project Title</label>
        <input
          type="text"
          value={formData.projectTitle}
          onChange={(e) => handleInputChange("projectTitle", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Project Description</label>
        <textarea
          value={formData.projectDescription}
          onChange={(e) => handleInputChange("projectDescription", e.target.value)}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label>Category</label>
        <div className="category-grid">
          {categories.map((c) => (
            <div
              key={c.id}
              className={`category-card ${formData.category === c.id ? "selected" : ""}`}
              onClick={() => handleInputChange("category", c.id)}
            >
              <div className="category-icon" style={{ backgroundColor: c.color }}>
                {c.icon}
              </div>
              <h3>{c.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2 - Requirements
  const renderStep2 = () => (
    <div className="step-content card">
      <h2>Project Requirements</h2>

      {/* Budget */}
      <div className="form-group budget-group">
        <label>Budget: <strong>₹{formData.budget}</strong></label>
        <input
          type="range"
          min={10000}
          max={200000}
          step={5000}
          value={formData.budget}
          className="budget-slider"
          onChange={(e) => handleInputChange("budget", Number(e.target.value))}
        />
        <div className="budget-labels">
          <span>₹10k</span>
          <span>₹2L</span>
        </div>
      </div>

      {/* Priority */}
      <div className="form-group priority-group">
        <label>Priority</label>
        <div className="priority-cards">
          {priorities.map((p) => (
            <div
              key={p.id}
              className={`priority-card ${formData.priority === p.id ? "selected" : ""}`}
              onClick={() => handleInputChange("priority", p.id)}
            >
              <strong>{p.label}</strong>
              <span>{p.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Size */}
      <div className="form-group team-size-group">
        <label>Team Size Preference</label>
        <input
          type="number"
          min={1}
          max={50}
          value={formData.teamSize}
          onChange={(e) => handleInputChange("teamSize", Number(e.target.value))}
          className="team-size-input"
        />
      </div>
    </div>
  );

  // Step 3 - Features
  const renderStep3 = () => (
    <div className="step-content card">
      <h2>Features</h2>
      <div className="form-group">
        <label>Core Features</label>
        <div className="option-grid">
          {coreFeaturesList.map((f) => (
            <button
              key={f}
              type="button"
              className={`option-btn ${formData.coreFeatures.includes(f) ? "selected" : ""}`}
              onClick={() => toggleArrayItem("coreFeatures", f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Third-party Integrations</label>
        <div className="option-grid">
          {integrationsList.map((f) => (
            <button
              key={f}
              type="button"
              className={`option-btn ${formData.integrations.includes(f) ? "selected" : ""}`}
              onClick={() => toggleArrayItem("integrations", f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Design Style Preference</label>
        <div className="option-grid">
          {designStyles.map((f) => (
            <button
              key={f}
              type="button"
              className={`option-btn ${formData.designStyle === f ? "selected" : ""}`}
              onClick={() => handleInputChange("designStyle", f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 4 - Platform & Deployment
  const renderStep4 = () => (
    <div className="step-content card">
      <h2>Platform & Deployment</h2>
      <div className="form-group">
        <label>Target Platforms</label>
        <div className="option-grid">
          {platformsList.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`option-btn ${formData.platforms.includes(p.id) ? "selected" : ""}`}
              onClick={() => toggleArrayItem("platforms", p.id)}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Support Level</label>
        <div className="sticky-notes">
          {supportLevels.map((s) => (
            <div
              key={s.id}
              className={`sticky-note ${formData.supportLevel === s.id ? "selected" : ""}`}
              onClick={() => handleInputChange("supportLevel", s.id)}
            >
              <strong>{s.label}</strong>
              <p>{s.description}</p>
              {s.badge && <span>{s.badge}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Additional Notes</label>
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  // Step 5 - Review & Submit
  const renderStep5 = () => (
    <div className="step-content card">
      <h2>Review Your Project</h2>
      <div className="review-box">
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
      <button className="btn-submit" onClick={handleSubmit}>
        Submit Request
      </button>
    </div>
  );

  return (
    <div className="container">
      <div className="form-wrapper">
        <div className="header">
          <h1>New Project Request</h1>
          <span className="step-indicator">Step {step} of 5</span>
        </div>
        {renderStepContent()}
        <div className="form-footer">
          <button className="btn-secondary" onClick={prevStep} disabled={step === 1}>
            ← Previous
          </button>
          {step < 5 && (
            <button className="btn-primary" onClick={nextStep}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectRequest;
