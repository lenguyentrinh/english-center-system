import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth.ts";
import { getCourses } from "@/features/courses/courseApi.ts";
import { getCoursesByTeacherUserId } from "@/features/teachers/teachersApi.ts";
import type { Course } from "@/features/courses/types.ts";

const NONE: Course[] = [];

/** Every live course (shared react-query cache key with the admin class list). */
export function useAllCourses() {
  const { data, isLoading } = useQuery({ queryKey: ["courses"], queryFn: getCourses, staleTime: 60_000 });
  const courses = data?.data ?? NONE;
  const nameById = useMemo(() => new Map(courses.map((c) => [c.id, c.name])), [courses]);
  const nameOf = useCallback((id?: string | null) => (id ? (nameById.get(id) ?? "—") : "—"), [nameById]);
  return { courses, isLoading, nameOf };
}

/** Courses taught by the logged-in teacher that still accept work (not CLOSE). */
export function useTeacherCourses() {
  const { user } = useAuth();
  const { courses, isLoading: loadingAll, nameOf } = useAllCourses();
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-courses", user?.id],
    queryFn: () => getCoursesByTeacherUserId(user!.id).catch(() => ({ status: 200, message: "", data: [] })),
    enabled: !!user,
    staleTime: 60_000,
  });
  const mine = useMemo(() => {
    const ids = new Set((data?.data ?? []).map((c) => c.id));
    return courses.filter((c) => ids.has(c.id) && c.status !== "CLOSE");
  }, [data, courses]);
  return { courses: mine, isLoading: isLoading || loadingAll, nameOf };
}
