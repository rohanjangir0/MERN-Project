import AdminDashboard from "./AdminDashboard/AdminDashboard";
import AdminLeaveApprovals from "./AdminLeaveApprovals/AdminLeaveApprovals";
import EmployeeManagement from "./EmployeeDetailes/EmployeeManagement";
import TaskManagement from "./TaskManagement/TaskManagement";
import AdminChatApp from "./AdminChatApp/AdminChatApp";
import AdminDocuments from "./AdminDocuments/AdminDocuments";
import ClientManagement from "./ClientManagement/ClientManagement";
import ClientProposals from "./ClientProposals/ClientProposals"; // ✅ NEW

export const adminRoutes = [
  { path: "dashboard", element: <AdminDashboard /> },
  { path: "leave-approvals", element: <AdminLeaveApprovals /> },
  { path: "employee-management", element: <EmployeeManagement /> },
  { path: "task-management", element: <TaskManagement /> },
  { path: "chat", element: <AdminChatApp userId={"68cd060f433e048855e28479"} /> },
  { path: "documents", element: <AdminDocuments /> },
  { path: "client-management", element: <ClientManagement /> },
  { path: "client-proposals", element: <ClientProposals /> }, // ✅ NEW ROUTE
];
