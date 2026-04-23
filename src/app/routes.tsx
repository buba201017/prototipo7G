import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { MapMonitoring } from "./pages/MapMonitoring";
import { RealTimeOperations } from "./pages/RealTimeOperations";
import { LuggageRegistration } from "./pages/LuggageRegistration";
import { Reports } from "./pages/Reports";
import { Dashboard } from "./pages/Dashboard";
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: MapMonitoring },
      { path: "operacion-dia-a-dia", Component: RealTimeOperations },
      { path: "registro-maletas", Component: LuggageRegistration },
      { path: "dashboard", Component: Dashboard },
      { path: "reportes", Component: Reports },
    ],
  },
]);
