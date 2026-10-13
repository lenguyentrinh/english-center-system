import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/shared/components/layout/Header.tsx";
import Footer from "@/shared/components/layout/Footer.tsx";
import CourseTable from "@/components/courses/CourseTable";
import CourseModal from "@/components/courses/CourseModal";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { useQueryErrorMessage } from "@/shared/hooks/useQueryErrorMessage.ts";
import { getCourses } from "@/features/courses/courseApi.ts";
import { useCourseMutations } from "@/features/courses/useCourseMutations.ts";
import type { Course, UpsertCoursePayload } from "@/features/courses/types.ts";

const NO_COURSES: Course[] = [];

export default function CoursesManagePage() {
  const { data, isLoading: loadingList, error: queryError } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });
  const courses = data?.data ?? NO_COURSES;
  const listError = useQueryErrorMessage(queryError, "Failed to load courses");
  const { create, update, remove, submitting } = useCourseMutations();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const handleCreateSubmit = async (payload: UpsertCoursePayload) => {
    try {
      const res = await create.mutateAsync(payload);
      toast.success(res.message);
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Create failed"));
    }
  };

  const handleUpdateSubmit = async (payload: UpsertCoursePayload) => {
    if (!editingCourse) return;

    try {
      const res = await update.mutateAsync({ id: editingCourse.id, payload });
      toast.success(res.message);
      setIsEditModalOpen(false);
      setEditingCourse(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Update failed"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCourseId) return;

    try {
      const res = await remove.mutateAsync(deletingCourseId);
      toast.success(res.message);
      setIsDeleteConfirmOpen(false);
      setDeletingCourseId(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
              <p className="mt-1 text-sm text-slate-600">Manage all your courses in one place</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add Course
            </button>
          </div>

          {listError && <div className="mb-6 text-red-600">{listError}</div>}

          <CourseTable
            courses={courses}
            loading={loadingList}
            onUpdate={(item) => {
                setEditingCourse(item);
                setIsEditModalOpen(true);
              }}
              onDelete={(id) => {
                setDeletingCourseId(id);
                setIsDeleteConfirmOpen(true);
              }}
            submitting={submitting}
          />
        </div>
      </main>

      <CourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        submitting={submitting}
        editingCourse={null}
      />

      <CourseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateSubmit}
        submitting={submitting}
        editingCourse={editingCourse}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Course"
        message="Are you sure you want to delete this course?"
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={submitting}
        isDangerous
      />

      <Footer />
    </>
  );
}