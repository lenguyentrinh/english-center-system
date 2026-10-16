import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth.ts";
import PageLoader from "@/shared/components/PageLoader.tsx";

type Props = PropsWithChildren<{
  /** Any one of these roles is enough. Omit to only require a signed-in user. */
  roles?: string[];
}>;

export default function RequireAuth({ roles, children }: Props) {
  const { isLoading, isAuthenticated, hasAnyRole } = useAuth();
  const location = useLocation();

  // Wait for /auth/me so a reload on a protected page does not bounce to login before we know.
  if (isLoading) return <PageLoader label="Đang kiểm tra phiên đăng nhập" />;

  if (!isAuthenticated) {
    const target = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/auth/login?return=${encodeURIComponent(target)}`} replace />;
  }

  // Signed in but wrong role: this is "forbidden", not "log in".
  if (roles && !hasAnyRole(roles)) return <Navigate to="/" replace />;

  return children;
}
