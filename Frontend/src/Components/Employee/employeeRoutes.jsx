import Dashboard from "./EmployeeDashboard/EmployeeDashboard";
import Tasks from "./Tasks/Tasks";
import Attendance from "./Attendance/Attendance";
import LeaveRequests from "./LeaveRequests/LeaveRequests";
import Documents from "./Documents/Documents";
import ChatApp from "./ChatApp/ChatApp";
import EmployeeMonitoringRequests from "./EmployeeMonitoringRequests/EmployeeMonitoringRequests";

export const employeeRoutes = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "tasks", element: <Tasks /> },
  { path: "attendance", element: <Attendance /> },
  { path: "leave-requests", element: <LeaveRequests /> },
  { path: "payroll", element: <h1>Payroll Page</h1> },
  { path: "documents", element: <Documents /> },
  { path: "chat", element: <ChatApp userId={"68cd060f433e048855e28479"} /> },
  { path: "employee-monitoring", element: <EmployeeMonitoringRequests /> }, // ✅ New Route
];
