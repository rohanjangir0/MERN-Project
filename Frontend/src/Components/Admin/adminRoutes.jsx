import AdminDashboard from "./AdminDashboard/AdminDashboard";
import AdminLeaveApprovals from "./AdminLeaveApprovals/AdminLeaveApprovals";
import EmployeeManagement from "./EmployeeDetailes/EmployeeManagement";
import TaskManagement from "./TaskManagement/TaskManagement"; // ✅ New Import
import AdminChatApp from "./AdminChatApp/AdminChatApp"; // ✅ New Import
import AdminDocuments from "./AdminDocuments/AdminDocuments"; // ✅ New Import

export const adminRoutes = [
  { path: "dashboard", element: <AdminDashboard /> },
  { path: "leave-approvals", element: <AdminLeaveApprovals /> },
  { path: "employee-management", element: <EmployeeManagement /> },
  { path: "task-management", element: <TaskManagement /> },
  { path: "chat", element: <AdminChatApp userId={"68cd060f433e048855e28479"} /> },
  { path: "documents", element: <AdminDocuments /> }, // ✅ New Route
];
