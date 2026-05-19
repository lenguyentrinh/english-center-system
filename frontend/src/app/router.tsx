import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage.tsx";
import TeachingClassesPage from "@/pages/TeachingClassesPage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import SignupPage from "@/pages/SignupPage.tsx";

const Placeholder = ({ title }: { title: string }) => (
  <main className="p-6 text-slate-700">{title}</main>
);

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/auth/login", element: <LoginPage /> },
  { path: "/auth/signup", element: <SignupPage /> },
  { path: "/teaching-classes", element: <TeachingClassesPage /> },
  { path: "/contact", element: <Placeholder title="Contact page (todo)" /> },
  { path: "*", element: <Placeholder title="404 - Not found" /> },
]);