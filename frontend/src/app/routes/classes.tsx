import type { RouteObject } from "react-router-dom";
import RequireAuth from "@/shared/components/auth/RequireAuth";
import TeacherClassesPage from "@/pages/teacher/TeacherClassesPage";
import TeacherClassDetailPage from "@/pages/teacher/TeacherClassDetailPage";
import StudentClassesPage from "@/pages/student/StudentClassesPage";
import StudentClassDetailPage from "@/pages/student/StudentClassDetailPage";

const TEACHER_ROLES = ["TEACHER", "TEACHER_IELTS_6", "TEACHER_IELTS_7", "TEACHER_IELTS_8", "TEACHER_TOEIC_650", "TEACHER_TOEIC_750", "TEACHER_TOEIC_850"];
const STUDENT_ROLES = ["STUDENT"];

export const classRoutes: RouteObject[] = [
  { path: "/teacher/classes", element: <RequireAuth roles={TEACHER_ROLES}><TeacherClassesPage /></RequireAuth> },
  { path: "/teacher/classes/:id", element: <RequireAuth roles={TEACHER_ROLES}><TeacherClassDetailPage /></RequireAuth> },
  { path: "/student/classes", element: <RequireAuth roles={STUDENT_ROLES}><StudentClassesPage /></RequireAuth> },
  { path: "/student/classes/:id", element: <RequireAuth roles={STUDENT_ROLES}><StudentClassDetailPage /></RequireAuth> },
];
