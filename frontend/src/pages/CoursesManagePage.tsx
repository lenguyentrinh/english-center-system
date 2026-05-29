import { useEffect, useState } from "react";
import Header from "@/shared/components/layout/Header.tsx";
import Footer from "@/shared/components/layout/Footer.tsx";
import CourseTable from "@/components/courses/CourseTable";
import CourseModal from "@/components/courses/CourseModal";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks.ts";
import { toast } from "react-toastify";
import {
  fetchCourses,
  createCourseThunk,
  updateCourseThunk,
  deleteCourseThunk,
} from "@/features/courses/courseThunks.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import type { Course, UpsertCoursePayload } from "@/features/courses/types.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";

export default function CoursesManagePage() {
  const dispatch = useAppDispatch();

  const { courses, loadingList, submitting, listError } = useAppSelector(
    (state) => state.courses
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);

  useEffect(() => {
    void dispatch(fetchCourses());
  }, [dispatch]);

  const handleCreateSubmit = async (payload: UpsertCoursePayload) => {
    try {
      const res: ApiResponse<Course> = await dispatch(createCourseThunk(payload)).unwrap();
      toast.success(res.message);
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Create failed"));
    }
  };

  const handleUpdateSubmit = async (payload: UpsertCoursePayload) => {
    if (!editingCourse) return;

    try {
      const res: ApiResponse<Course> = await dispatch(
        updateCourseThunk({ id: editingCourse.id, payload })
      ).unwrap();
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
      const res: ApiResponse<null> = await dispatch(deleteCourseThunk(deletingCourseId)).unwrap();
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