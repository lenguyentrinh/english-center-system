import type { RouteObject } from "react-router-dom";
import RequireAuth from "@/shared/components/auth/RequireAuth.tsx";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage.tsx";
import AdminSchedulePage from "@/pages/admin/AdminSchedulePage.tsx";
import TeacherSchedulePage from "@/pages/teacher/TeacherSchedulePage.tsx";
import StudentSchedulePage from "@/pages/student/StudentSchedulePage.tsx";

const ADMIN = ["ADMIN"];
const TEACHER = ["TEACHER", "TEACHER_IELTS_6", "TEACHER_IELTS_7", "TEACHER_IELTS_8", "TEACHER_TOEIC_650", "TEACHER_TOEIC_750", "TEACHER_TOEIC_850"];
const STUDENT = ["STUDENT"];

export const scheduleRoutes: RouteObject[] = [
  { path: "/teacher/schedule", element: <RequireAuth roles={TEACHER}><TeacherSchedulePage /></RequireAuth> },
  { path: "/student/schedule", element: <RequireAuth roles={STUDENT}><StudentSchedulePage /></RequireAuth> },
  { path: "/admin/schedule", element: <RequireAuth roles={ADMIN}><AdminSchedulePage /></RequireAuth> },
  { path: "/admin/dashboard", element: <RequireAuth roles={ADMIN}><AdminDashboardPage /></RequireAuth> },
];
