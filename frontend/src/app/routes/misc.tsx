import type { RouteObject } from "react-router-dom";
import RequireAuth from "@/shared/components/auth/RequireAuth";
import AdminLibraryPage from "@/pages/admin/AdminLibraryPage";
import StudentHomePage from "@/pages/student/StudentHomePage";

export const miscRoutes: RouteObject[] = [
  { path: "/admin/library", element: <RequireAuth roles={["ADMIN"]}><AdminLibraryPage /></RequireAuth> },
  { path: "/student", element: <RequireAuth roles={["STUDENT"]}><StudentHomePage /></RequireAuth> },
];
