import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import SignupPage from "@/pages/SignupPage.tsx";
import CoursesPage from "@/pages/CoursesPage.tsx";
import CourseDetailPage from "@/pages/CourseDetailPage.tsx";
import AccountPage from "@/pages/AccountPage.tsx";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage.tsx";
import AdminClassesPage from "@/pages/admin/AdminClassesPage.tsx";
import AdminClassDetailPage from "@/pages/admin/AdminClassDetailPage.tsx";
import ManageUsersPage from "@/pages/admin/ManageUsersPage.tsx";
import UserDetailPage from "@/pages/admin/UserDetailPage.tsx";
import RequireAuth from "@/shared/components/auth/RequireAuth.tsx";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage.tsx";
import VerifyEmailPage from "@/pages/VerifyEmailPage.tsx";
import { Navigate, useParams } from "react-router-dom";
import { scheduleRoutes } from "@/app/routes/schedule.tsx";
import { classRoutes } from "@/app/routes/classes.tsx";
import { flashcardRoutes } from "@/app/routes/flashcards.tsx";
import { wordRushRoutes } from "@/app/routes/wordRush.tsx";
import { miscRoutes } from "@/app/routes/misc.tsx";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";

const ADMIN_ONLY = ["ADMIN"];

const CourseRedirect = () => <Navigate to={`/admin/classes/${useParams().id ?? ""}`} replace />;

const Placeholder = ({ title }: { title: string }) => (
  <PublicLayout>
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
      </div>
    </main>
  </PublicLayout>
);

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/auth/login", element: <LoginPage /> },
  { path: "/auth/signup", element: <SignupPage /> },
  { path: "/auth/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/auth/verify-email", element: <VerifyEmailPage /> },
  { path: "/account", element: <RequireAuth><AccountPage /></RequireAuth> },
  { path: "/courses", element: <CoursesPage /> },
  { path: "/courses/:id", element: <CourseDetailPage /> },
  { path: "/teaching-classes", element: <Navigate to="/courses" replace /> },
  { path: "/admin", element: <RequireAuth roles={ADMIN_ONLY}><Navigate to="/admin/schedule" replace /></RequireAuth> },
  { path: "/admin/users", element: <RequireAuth roles={ADMIN_ONLY}><ManageUsersPage /></RequireAuth> },
  { path: "/admin/users/:id", element: <RequireAuth roles={ADMIN_ONLY}><UserDetailPage /></RequireAuth> },
  { path: "/admin/classes", element: <RequireAuth roles={ADMIN_ONLY}><AdminClassesPage /></RequireAuth> },
  { path: "/admin/classes/:id", element: <RequireAuth roles={ADMIN_ONLY}><AdminClassDetailPage /></RequireAuth> },
  { path: "/admin/categories", element: <RequireAuth roles={ADMIN_ONLY}><AdminCategoriesPage /></RequireAuth> },
  { path: "/admin/courses", element: <Navigate to="/admin/classes" replace /> },
  { path: "/admin/courses/:id", element: <CourseRedirect /> },
  ...scheduleRoutes,
  ...classRoutes,
  ...flashcardRoutes,
  ...wordRushRoutes,
  ...miscRoutes,
  { path: "/contact", element: <Placeholder title="Contact page (todo)" /> },
  { path: "*", element: <Placeholder title="404 - Not found" /> },
]);