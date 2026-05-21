import { useEffect, useState, type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { probeAdminAccess } from "@/features/auth/authApi.ts";
import { getCurrentUsername } from "@/features/auth/authIdentity.ts";
import {
  getAdminAccessState,
  isAuthenticated,
  setAdminAccessState,
} from "@/features/auth/authSession.ts";

export default function RequireAdmin({ children }: PropsWithChildren) {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState<boolean>(() => getAdminAccessState() === true);

  useEffect(() => {
    const validate = async () => {
      if (!isAuthenticated()) {
        setAllowed(false);
        setChecked(true);
        return;
      }

      const cached = getAdminAccessState();
      if (cached !== null) {
        setAllowed(cached);
        setChecked(true);
        return;
      }

      const adminAllowed = await probeAdminAccess();
      setAdminAccessState(adminAllowed);
      setAllowed(adminAllowed);
      setChecked(true);
    };

    void validate();
  }, []);

  if (!checked) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">
        Checking permissions...
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to={isAuthenticated() ? "/" : "/auth/login"} replace state={{ from: getCurrentUsername() }} />;
  }

  return children;
}