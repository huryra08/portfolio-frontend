import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import RequireAdmin from "./components/RequireAdmin";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import { Spinner } from "./components/ui";

// the admin area is only loaded when someone opens it
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProjectsAdmin = lazy(() => import("./pages/admin/ProjectsAdmin"));
const SkillsAdmin = lazy(() => import("./pages/admin/SkillsAdmin"));
const ExperienceAdmin = lazy(() => import("./pages/admin/ExperienceAdmin"));
const ProfileAdmin = lazy(() => import("./pages/admin/ProfileAdmin"));
const MessagesAdmin = lazy(() => import("./pages/admin/MessagesAdmin"));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
        </Route>

        <Route path="admin/login" element={<Login />} />
        <Route path="admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectsAdmin />} />
            <Route path="skills" element={<SkillsAdmin />} />
            <Route path="experience" element={<ExperienceAdmin />} />
            <Route path="profile" element={<ProfileAdmin />} />
            <Route path="messages" element={<MessagesAdmin />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
