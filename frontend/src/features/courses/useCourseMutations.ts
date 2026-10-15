import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCourse, deleteCourse, updateCourse } from "./courseApi.ts";
import type { UpsertCoursePayload } from "./types.ts";

/** Create / update / delete mutations for courses; refreshes cached course data on success. */
export function useCourseMutations() {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["course-schedule"] });
    return queryClient.invalidateQueries({ queryKey: ["courses"] });
  };

  const create = useMutation({
    mutationFn: (payload: UpsertCoursePayload) => createCourse(payload),
    onSuccess: refresh,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertCoursePayload }) =>
      updateCourse(id, payload),
    onSuccess: (_res, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["course", id] });
      return refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: refresh,
  });

  return {
    create,
    update,
    remove,
    submitting: create.isPending || update.isPending || remove.isPending,
  };
}
