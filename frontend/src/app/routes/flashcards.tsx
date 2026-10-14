import type { RouteObject } from "react-router-dom";
import RequireAuth from "@/shared/components/auth/RequireAuth.tsx";
import TeacherFlashcardsPage from "@/pages/teacher/TeacherFlashcardsPage.tsx";
import TeacherFlashcardDeckPage from "@/pages/teacher/TeacherFlashcardDeckPage.tsx";
import StudentFlashcardsPage from "@/pages/student/StudentFlashcardsPage.tsx";
import StudentFlashcardStudyPage from "@/pages/student/StudentFlashcardStudyPage.tsx";
import StudentFlashcardTestPage from "@/pages/student/StudentFlashcardTestPage.tsx";

const TEACHER_ROLES = ["TEACHER", "TEACHER_IELTS_6", "TEACHER_IELTS_7", "TEACHER_IELTS_8", "TEACHER_TOEIC_650", "TEACHER_TOEIC_750", "TEACHER_TOEIC_850"];
const STUDENT_ROLES = ["STUDENT"];

export const flashcardRoutes: RouteObject[] = [
  { path: "/teacher/flashcards", element: <RequireAuth roles={TEACHER_ROLES}><TeacherFlashcardsPage /></RequireAuth> },
  { path: "/teacher/flashcards/:id", element: <RequireAuth roles={TEACHER_ROLES}><TeacherFlashcardDeckPage /></RequireAuth> },
  { path: "/student/flashcards", element: <RequireAuth roles={STUDENT_ROLES}><StudentFlashcardsPage /></RequireAuth> },
  { path: "/student/flashcards/:id/study", element: <RequireAuth roles={STUDENT_ROLES}><StudentFlashcardStudyPage /></RequireAuth> },
  { path: "/student/flashcards/:id/test", element: <RequireAuth roles={STUDENT_ROLES}><StudentFlashcardTestPage /></RequireAuth> },
];
