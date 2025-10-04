import ClientDashboard from "./ClientDashboard/ClientDashboard";
import ProjectRequest from "./ProjectRequest/ProjectRequest";
import ProjectProposals from "./ProjectProposals/ProjectProposals";
import SupportTickets from "./SupportTickets/SupportTickets";

export const clientRoutes = [
  { path: "dashboard", element: <ClientDashboard /> },
  { path: "project-request", element: <ProjectRequest /> },
  { path: "proposals", element: <ProjectProposals /> },
  { path: "support-tickets", element: <SupportTickets /> }, // ✅ new route
];
