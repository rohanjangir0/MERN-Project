import ClientDashboard from "./ClientDashboard/ClientDashboard";
import ProjectRequest from "./ProjectRequest/ProjectRequest";
import ProjectProposals from "./ProjectProposals/ProjectProposals";
// import Communication from "./Communication/Communication";
// import Schedule from "./Schedule/Schedule";
// import Documents from "./Documents/Documents";
// import ClientSettings from "./ClientSettings/ClientSettings";

export const clientRoutes = [
  { path: "dashboard", element: <ClientDashboard /> },
  { path: "project-request", element: <ProjectRequest /> },
  { path: "proposals", element: <ProjectProposals /> },
  // { path: "communication", element: <Communication /> },
  // { path: "schedule", element: <Schedule /> },
  // { path: "documents", element: <Documents /> },
  // { path: "settings", element: <ClientSettings /> },
];
