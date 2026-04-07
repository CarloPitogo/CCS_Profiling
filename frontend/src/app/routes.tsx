import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Students } from "./pages/Students";
import { StudentProfile } from "./pages/StudentProfile";
import { Faculty } from "./pages/Faculty";
import { Instruction } from "./pages/Instruction";
import { Scheduling } from "./pages/Scheduling";
import { Events } from "./pages/Events";
import { Search } from "./pages/Search";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { SystemLogs } from "./pages/SystemLogs";
import { ProtectedLayout } from "./components/ProtectedLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "students", Component: Students },
      { path: "students/:id", Component: StudentProfile },
      { path: "faculty", Component: Faculty },
      { path: "instruction", Component: Instruction },
      { path: "scheduling", Component: Scheduling },
      { path: "events", Component: Events },
      { path: "search", Component: Search },
      { path: "logs", Component: SystemLogs },
    ],
  },
]);