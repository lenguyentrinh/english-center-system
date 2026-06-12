import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Button from "@/shared/components/Button.tsx";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import ConfirmDialog from "@/shared/components/ConfirmDialog.tsx";
import RoleModal from "@/components/admin/RoleModal.tsx";
import { useAppDispatch, useAppSelector } from "@/app/hooks.ts";
import {
  createRoleThunk,
  deleteRoleThunk,
  fetchBusinessRoles,
  fetchRoles,
  updateRoleThunk,
} from "@/features/admin/adminThunks.ts";
import type { RoleResponse, RoleUpsertPayload } from "@/features/admin/types.ts";

const badgeClass = (active: boolean) =>
  active
    ? "bg-emerald-100 text-emerald-800"
    : "bg-slate-100 text-slate-600";

export default function ManageRolesPage() {
  const dispatch = useAppDispatch();
  const { roles, businessRoles, loadingRoles: loadingRolesState, loadingBusinessRoles: loadingBusinessRolesState, submitting, error } = useAppSelector((state) => state.admin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleResponse | null>(null);

  const loading = loadingRolesState || loadingBusinessRolesState;

  useEffect(() => {
    void dispatch(fetchRoles());
    void dispatch(fetchBusinessRoles());
  }, [dispatch]);

  const businessRoleOptions = useMemo(
    () =>
      businessRoles.map((businessRole) => ({
        value: String(businessRole.id),
        label: `${businessRole.code}${businessRole.active ? "" : " (inactive)"}`,
      })),
    [businessRoles]
  );

  const sortedRoles = useMemo(
    () => [...roles].sort((left, right) => left.code.localeCompare(right.code)),
    [roles]
  );

  const summary = useMemo(() => {
    const active = roles.filter((role) => role.active).length;
    const linked = roles.filter((role) => role.businessRoleId != null).length;
    return {
      total: roles.length,
      active,
      linked,
      unlinked: roles.length - linked,
    };
  }, [roles]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: RoleResponse) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: RoleUpsertPayload) => {
    try {
      const res = editingRole
        ? await dispatch(updateRoleThunk({ id: editingRole.id, payload })).unwrap()
        : await dispatch(createRoleThunk(payload)).unwrap();

      toast.success(res.message);
      closeModal();
      void dispatch(fetchRoles());
    } catch (err) {
      toast.error(err as string);
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;

    try {
      const res = await dispatch(deleteRoleThunk(deletingRole.id)).unwrap();
      toast.success(res.message);
      setDeletingRole(null);
      void dispatch(fetchRoles());
    } catch (err) {
      toast.error(err as string);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Manage Roles
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Create, edit, and retire direct roles that can be assigned to users or mapped to business roles.
          </p>
        </div>

        <Button onClick={handleOpenCreate}>Add Role</Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total roles", String(summary.total)],
          ["Active roles", String(summary.active)],
          ["Linked to business roles", String(summary.linked)],
          ["Standalone roles", String(summary.unlinked)],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          </article>
        ))}
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Business role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={5}>
                    Loading roles...
                  </td>
                </tr>
              ) : sortedRoles.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={5}>
                    No roles found.
                  </td>
                </tr>
              ) : (
                sortedRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-slate-900">{role.code}</td>
                    <td className="px-6 py-4 text-slate-700">{role.description ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{role.businessRoleCode ?? "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(role.active)}`}
                      >
                        {role.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button size="small" variant="secondary" onClick={() => handleOpenEdit(role)}>Edit</Button>
                        <Button size="small" variant="danger" onClick={() => setDeletingRole(role)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RoleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitting={submitting}
        editingRole={editingRole}
        businessRoleOptions={businessRoleOptions}
      />

      <ConfirmDialog
        isOpen={!!deletingRole}
        title="Delete Role"
        message={
          deletingRole
            ? `Are you sure you want to delete ${deletingRole.code}?`
            : "Are you sure you want to delete this role?"
        }
        onCancel={() => setDeletingRole(null)}
        onConfirm={handleDelete}
        isLoading={submitting}
        isDangerous
      />
    </AdminLayout>
  );
}
