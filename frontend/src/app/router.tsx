import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import SignupPage from "@/pages/SignupPage.tsx";
import CoursesPage from "@/pages/CoursesPage.tsx";
import CourseDetailPage from "@/pages/CourseDetailPage.tsx";
import AccountPage from "@/pages/AccountPage.tsx";
import AdminCoursesPage from "@/pages/admin/AdminCoursesPage.tsx";
import ManageRolesPage from "@/pages/admin/ManageRolesPage.tsx";
import ManageBusinessRolesPage from "@/pages/admin/ManageBusinessRolesPage.tsx";
import ManageUsersPage from "@/pages/admin/ManageUsersPage.tsx";
import UserDetailPage from "@/pages/admin/UserDetailPage.tsx";
import RequireAdmin from "@/shared/components/auth/RequireAdmin.tsx";
import { Navigate } from "react-router-dom";
import PublicLayout from "@/shared/components/layout/PublicLayout.tsx";

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
  { path: "/account", element: <AccountPage /> },
  { path: "/courses", element: <CoursesPage /> },
  { path: "/courses/:id", element: <CourseDetailPage /> },
  { path: "/teaching-classes", element: <Navigate to="/courses" replace /> },
  { path: "/admin", element: <RequireAdmin><Navigate to="/admin/users" replace /></RequireAdmin> },
  { path: "/admin/users", element: <RequireAdmin><ManageUsersPage /></RequireAdmin> },
  { path: "/admin/users/:id", element: <RequireAdmin><UserDetailPage /></RequireAdmin> },
  { path: "/admin/courses", element: <RequireAdmin><AdminCoursesPage /></RequireAdmin> },
  { path: "/admin/roles", element: <RequireAdmin><ManageRolesPage /></RequireAdmin> },
  { path: "/admin/business-roles", element: <RequireAdmin><ManageBusinessRolesPage /></RequireAdmin> },
  { path: "/contact", element: <Placeholder title="Contact page (todo)" /> },
  { path: "*", element: <Placeholder title="404 - Not found" /> },
]);