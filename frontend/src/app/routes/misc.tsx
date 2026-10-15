import type { RouteObject } from "react-router-dom";
import RequireAuth from "@/shared/components/auth/RequireAuth";
import AdminLibraryPage from "@/pages/admin/AdminLibraryPage";
import AdminLibraryDetailPage from "@/pages/admin/AdminLibraryDetailPage";

export const miscRoutes: RouteObject[] = [
  { path: "/admin/library", element: <RequireAuth roles={["ADMIN"]}><AdminLibraryPage /></RequireAuth> },
  { path: "/admin/library/:id", element: <RequireAuth roles={["ADMIN"]}><AdminLibraryDetailPage /></RequireAuth> },
];
