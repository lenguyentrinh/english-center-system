import { useEffect, useState } from "react";
import Header from "@/shared/components/layout/Header.tsx";
import Footer from "@/shared/components/layout/Footer.tsx";
import TeachingClassTable from "@/components/teaching-classes/TeachingClassTable";
import TeachingClassModal from "@/components/teaching-classes/TeachingClassModal";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks.ts";

import { toast } from "react-toastify";

import {
  fetchTeachingClasses,
  createTeachingClassThunk,
  updateTeachingClassThunk,
  deleteTeachingClassThunk,
} from "@/features/teaching-classes/teachingClassesThunks.ts";

import { getApiErrorMessage } from "@/shared/api/error.ts";
import type {
  TeachingClass,
  UpsertTeachingClassPayload,
} from "@/features/teaching-classes/types.ts";
import type { ApiResponse } from "@/shared/types/api-response.type";

export default function TeachingClassesPage() {
  const dispatch = useAppDispatch();

  const { classes, loadingList, submitting, listError } = useAppSelector(
    (state) => state.teachingClasses
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [editingClass, setEditingClass] = useState<TeachingClass | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<number | null>(null);

  useEffect(() => {
    void dispatch(fetchTeachingClasses());
  }, [dispatch]);

  /* ================= CREATE ================= */
  const handleCreateSubmit = async (payload: UpsertTeachingClassPayload) => {
    try {
      const res: ApiResponse<TeachingClass> = await dispatch(
        createTeachingClassThunk(payload)
      ).unwrap();

      toast.success(res.message);

      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Create failed"));
    }
  };

  /* ================= UPDATE ================= */
  const handleUpdateSubmit = async (payload: UpsertTeachingClassPayload) => {
    if (!editingClass) return;

    try {
      const res: ApiResponse<TeachingClass> = await dispatch(
        updateTeachingClassThunk({
          id: editingClass.id,
          payload,
        })
      ).unwrap();

      toast.success(res.message);

      setIsEditModalOpen(false);
      setEditingClass(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Update failed"));
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteConfirm = async () => {
    if (!deletingClassId) return;

    try {
      const res: ApiResponse<null> = await dispatch(
        deleteTeachingClassThunk(deletingClassId)
      ).unwrap();

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

          {/* 🔥 GIỮ NGUYÊN UI GỐC */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Teaching Classes
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage all your teaching classes in one place
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add Teaching Class
            </button>
          </div>

          {listError && (
            <div className="mb-6 text-red-600">
              {listError}
            </div>
          )}

          {/* TABLE */}
          <TeachingClassTable
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

      {/* MODALS */}
      <TeachingClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        submitting={submitting}
        editingClass={null}
      />

      <TeachingClassModal
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

      <Footer />
    </>
  );
}