import Dashboard from "./EmployeeDashboard/EmployeeDashboard";
import Tasks from "./Tasks/Tasks";
import Attendance from "./Attendance/Attendance";
import LeaveRequests from "./LeaveRequests/LeaveRequests";
import Documents from "./Documents/Documents";
import ChatApp from "./ChatApp/ChatApp";
import EmployeeMonitoringRequests from "./EmployeeMonitoringRequests/EmployeeMonitoringRequests";


const id = localStorage.getItem("employeeId");
const name = localStorage.getItem("name") || "Employee";

export const employeeRoutes = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "tasks", element: <Tasks /> },
  { path: "attendance", element: <Attendance /> },
  { path: "leave-requests", element: <LeaveRequests /> },
  { path: "payroll", element: <h1>Payroll Page</h1> },
  { path: "documents", element: <Documents /> },
  { path: "chat", element: <ChatApp userId={id} /> },
  { path: "employee-monitoring", element: <EmployeeMonitoringRequests employeeId={id} employeeName={name} /> }, 
];

