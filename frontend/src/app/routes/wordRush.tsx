import type { RouteObject } from "react-router-dom";
import RequireAuth from "@/shared/components/auth/RequireAuth.tsx";
import TeacherWordRushPage from "@/pages/teacher/TeacherWordRushPage.tsx";
import TeacherWordRushSetPage from "@/pages/teacher/TeacherWordRushSetPage.tsx";
import TeacherWordRushRoomPage from "@/pages/teacher/TeacherWordRushRoomPage.tsx";
import StudentWordRushPage from "@/pages/student/StudentWordRushPage.tsx";
import { STUDENT_ROLES, TEACHER_ROLES } from "@/features/wordRush/constants.ts";

export const wordRushRoutes: RouteObject[] = [
  { path: "/teacher/word-rush", element: <RequireAuth roles={TEACHER_ROLES}><TeacherWordRushPage /></RequireAuth> },
  { path: "/teacher/word-rush/sets/:id", element: <RequireAuth roles={TEACHER_ROLES}><TeacherWordRushSetPage /></RequireAuth> },
  { path: "/teacher/word-rush/room", element: <RequireAuth roles={TEACHER_ROLES}><TeacherWordRushRoomPage /></RequireAuth> },
  { path: "/student/word-rush", element: <RequireAuth roles={STUDENT_ROLES}><StudentWordRushPage /></RequireAuth> },
];
