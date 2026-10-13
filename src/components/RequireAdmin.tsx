import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useMe } from "@/api/auth";
import { Spinner } from "./ui";

export default function RequireAdmin() {
  const { data: user, isPending } = useMe();
  const location = useLocation();

  if (isPending) return <Spinner label="Checking your session" />;
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
