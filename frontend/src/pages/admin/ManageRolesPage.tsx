import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import ConfirmDialog from "@/shared/components/ConfirmDialog.tsx";
import RoleModal from "@/components/admin/RoleModal.tsx";
import {
  createRole,
  deleteRole,
  getBusinessRoles,
  getRoles,
  updateRole,
} from "@/features/admin/adminApi.ts";
import type {
  BusinessRoleResponse,
  RoleResponse,
  RoleUpsertPayload,
} from "@/features/admin/types.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";

const badgeClass = (active: boolean) =>
  active
    ? "bg-emerald-100 text-emerald-800"
    : "bg-slate-100 text-slate-600";

export default function ManageRolesPage() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [businessRoles, setBusinessRoles] = useState<BusinessRoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleResponse | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rolesRes, businessRolesRes] = await Promise.all([getRoles(), getBusinessRoles()]);
      setRoles(rolesRes.data);
      setBusinessRoles(businessRolesRes.data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to load roles");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

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
      setSubmitting(true);

      const res = editingRole
        ? await updateRole(editingRole.id, payload)
        : await createRole(payload);

      toast.success(res.message);
      closeModal();
      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, editingRole ? "Failed to update role" : "Failed to create role"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;

    try {
      setSubmitting(true);
      const res = await deleteRole(deletingRole.id);
      toast.success(res.message);
      setDeletingRole(null);
      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete role"));
    } finally {
      setSubmitting(false);
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

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add Role
        </button>
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
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(role)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingRole(role)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          Delete
                        </button>
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