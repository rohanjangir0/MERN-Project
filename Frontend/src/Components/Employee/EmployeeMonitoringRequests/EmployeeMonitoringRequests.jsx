import React from "react";
import { useMonitoring } from "../../../context/MonitoringContext";
import "./EmployeeMonitoringRequests.css";

export default function EmployeeMonitoringRequests() {
  const { requests, respondRequest } = useMonitoring();

  if (!requests) return <p>Loading monitoring requests...</p>;

  return (
    <div className="monitor-requests">
      <h2>Incoming Monitoring Requests</h2>
      {requests.length === 0 ? (
        <p>No new requests.</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} className={`req-card ${req.status}`}>
            <div className="req-info">
              <h4>{req.type} Request</h4>
              <p>{req.message}</p>
            </div>
            {req.status === "pending" ? (
              <div className="req-actions">
                <button onClick={() => respondRequest(req, "accepted")}>✅ Allow</button>
                <button onClick={() => respondRequest(req, "declined")}>❌ Deny</button>
              </div>
            ) : (
              <p>Status: {req.status}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
