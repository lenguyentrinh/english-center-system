import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import ConfirmDialog from "@/shared/components/ConfirmDialog.tsx";
import CourseTable from "@/components/courses/CourseTable";
import CourseModal from "@/components/courses/CourseModal";
import { useAppDispatch, useAppSelector } from "@/app/hooks.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import type { Course, UpsertCoursePayload } from "@/features/courses/types.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";
import {
  createTeachingClassThunk,
  deleteTeachingClassThunk,
  fetchTeachingClasses,
  updateTeachingClassThunk,
} from "@/features/courses/courseThunks.ts";

export default function AdminCoursesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { classes, loadingList, submitting, listError } = useAppSelector(
    (state) => state.teachingClasses
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [editingClass, setEditingClass] = useState<Course | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<number | null>(null);

  useEffect(() => {
    void dispatch(fetchTeachingClasses());
  }, [dispatch]);

  const handleCreateSubmit = async (payload: UpsertCoursePayload) => {
    try {
      const res: ApiResponse<Course> = await dispatch(createTeachingClassThunk(payload)).unwrap();
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
        updateTeachingClassThunk({ id: editingClass.id, payload })
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
      const res: ApiResponse<null> = await dispatch(deleteTeachingClassThunk(deletingClassId)).unwrap();
      toast.success(res.message);
      setIsDeleteConfirmOpen(false);
      setDeletingClassId(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Delete failed"));
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Manage Courses
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Create, edit, and remove courses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add Course
        </button>
      </div>

      {listError ? <div className="mb-6 text-red-600">{listError}</div> : null}

      <CourseTable
        classes={classes}
        loading={loadingList}
        onView={(item) => navigate(`/courses/${item.id}`)}
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
        title="Delete Class"
        message="Are you sure you want to delete this class?"
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={submitting}
        isDangerous
      />
    </AdminLayout>
  );
}