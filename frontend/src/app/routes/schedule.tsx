import type { RouteObject } from "react-router-dom";
import RequireAuth from "@/shared/components/auth/RequireAuth.tsx";
import AdminSchedulePage from "@/pages/admin/AdminSchedulePage.tsx";
import TeacherSchedulePage from "@/pages/teacher/TeacherSchedulePage.tsx";
import StudentSchedulePage from "@/pages/student/StudentSchedulePage.tsx";

const ADMIN = ["ADMIN"];
const TEACHER = ["TEACHER"];
const STUDENT = ["STUDENT"];

export const scheduleRoutes: RouteObject[] = [
  { path: "/teacher/schedule", element: <RequireAuth roles={TEACHER}><TeacherSchedulePage /></RequireAuth> },
  { path: "/student/schedule", element: <RequireAuth roles={STUDENT}><StudentSchedulePage /></RequireAuth> },
  { path: "/admin/schedule", element: <RequireAuth roles={ADMIN}><AdminSchedulePage /></RequireAuth> },
];
