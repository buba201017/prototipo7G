import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { MapMonitoring } from "./pages/MapMonitoring";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: MapMonitoring },
    ],
  },
]);
