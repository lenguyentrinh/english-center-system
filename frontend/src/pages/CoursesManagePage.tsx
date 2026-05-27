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

  const { classes, loadingList, submitting, listError } = useAppSelector(
    (state) => state.teachingClasses
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Course | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<number | null>(null);

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
    if (!editingClass) return;

    try {
      const res: ApiResponse<Course> = await dispatch(
        updateCourseThunk({ id: editingClass.id, payload })
      ).unwrap();
      toast.success(res.message);
      setIsEditModalOpen(false);
      setEditingClass(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Update failed"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClassId) return;

    try {
      const res: ApiResponse<null> = await dispatch(deleteCourseThunk(deletingClassId)).unwrap();
      toast.success(res.message);
      setIsDeleteConfirmOpen(false);
      setDeletingClassId(null);
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
            classes={classes}
            loading={loadingList}
            onUpdate={(item) => {
              setEditingClass(item);
              setIsEditModalOpen(true);
            }}
            onDelete={(id) => {
              setDeletingClassId(id);
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
        editingClass={null}
      />

      <CourseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateSubmit}
        submitting={submitting}
        editingClass={editingClass}
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