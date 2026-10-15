import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth.ts";
import { getUserEnrollments } from "@/features/courses/courseApi.ts";

const NONE = new Set<string>();

/** Classes (course ids) and their categories the logged-in student is actively enrolled in. */
export function useStudentScope() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["user-detail", user?.id, "enrollments"],
    queryFn: () => getUserEnrollments(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });
  return useMemo(() => {
    const active = (data ?? []).filter((e) => e.enrollmentStatus === "ACTIVE");
    return {
      isLoading,
      courses: active.map((e) => e.course),
      courseIds: active.length ? new Set(active.map((e) => e.course.id)) : NONE,
      categoryIds: active.length ? new Set(active.map((e) => e.course.categoryId).filter((x): x is string => !!x)) : NONE,
    };
  }, [data, isLoading]);
}
