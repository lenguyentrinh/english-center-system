import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Button from "@/shared/components/Button.tsx";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import ConfirmDialog from "@/shared/components/ConfirmDialog.tsx";
import BusinessRoleModal from "@/components/admin/BusinessRoleModal.tsx";
import { useAppDispatch, useAppSelector } from "@/app/hooks.ts";
import {
  createBusinessRoleThunk,
  deleteBusinessRoleThunk,
  fetchBusinessRoles,
  fetchRoles,
  updateBusinessRoleThunk,
} from "@/features/admin/adminThunks.ts";
import type { BusinessRoleResponse, BusinessRoleUpsertPayload } from "@/features/admin/types.ts";

const badgeClass = (active: boolean) =>
  active
    ? "bg-emerald-100 text-emerald-800"
    : "bg-slate-100 text-slate-600";

export default function ManageBusinessRolesPage() {
  const dispatch = useAppDispatch();
  const { businessRoles, roles, loadingBusinessRoles, loadingRoles, submitting, error } = useAppSelector((state) => state.admin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusinessRole, setEditingBusinessRole] = useState<BusinessRoleResponse | null>(null);
  const [deletingBusinessRole, setDeletingBusinessRole] = useState<BusinessRoleResponse | null>(null);

  const loading = loadingBusinessRoles || loadingRoles;

  useEffect(() => {
    void dispatch(fetchBusinessRoles());
    void dispatch(fetchRoles());
  }, [dispatch]);

  const rolesByBusinessRoleId = useMemo(() => {
    const grouped = new Map<number, typeof roles>();

    roles.forEach((role) => {
      if (!role.businessRoleId) return;

      const existing = grouped.get(role.businessRoleId) ?? [];
      grouped.set(role.businessRoleId, [...existing, role]);
    });

    return grouped;
  }, [roles]);

  const sortedBusinessRoles = useMemo(
    () => [...businessRoles].sort((left, right) => left.code.localeCompare(right.code)),
    [businessRoles]
  );

  const summary = useMemo(() => {
    const active = businessRoles.filter((role) => role.active).length;
    const linkedRoles = roles.filter((role) => role.businessRoleId != null).length;
    return {
      total: businessRoles.length,
      active,
      inactive: businessRoles.length - active,
      linkedRoles,
    };
  }, [businessRoles, roles]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBusinessRole(null);
  };

  const handleOpenCreate = () => {
    setEditingBusinessRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (businessRole: BusinessRoleResponse) => {
    setEditingBusinessRole(businessRole);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: BusinessRoleUpsertPayload) => {
    try {
      const res = editingBusinessRole
        ? await dispatch(updateBusinessRoleThunk({ id: editingBusinessRole.id, payload })).unwrap()
        : await dispatch(createBusinessRoleThunk(payload)).unwrap();

      toast.success(res.message);
      closeModal();
      void dispatch(fetchBusinessRoles());
    } catch (err) {
      toast.error(err as string);
    }
  };

  const handleDelete = async () => {
    if (!deletingBusinessRole) return;

    try {
      const res = await dispatch(deleteBusinessRoleThunk(deletingBusinessRole.id)).unwrap();
      toast.success(res.message);
      setDeletingBusinessRole(null);
      void dispatch(fetchBusinessRoles());
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
            Manage Business Roles
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Keep business roles in sync with teaching tracks and assign them to users when needed.
          </p>
        </div>

        <Button onClick={handleOpenCreate}>Add Business Role</Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total business roles", String(summary.total)],
          ["Active business roles", String(summary.active)],
          ["Inactive business roles", String(summary.inactive)],
          ["Linked direct roles", String(summary.linkedRoles)],
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
                <th className="px-6 py-4 font-medium">Linked roles</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={5}>
                    Loading business roles...
                  </td>
                </tr>
              ) : sortedBusinessRoles.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={5}>
                    No business roles found.
                  </td>
                </tr>
              ) : (
                sortedBusinessRoles.map((businessRole) => {
                  const linkedRoles = rolesByBusinessRoleId.get(businessRole.id) ?? [];

                  return (
                    <tr key={businessRole.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-medium text-slate-900">{businessRole.code}</td>
                      <td className="px-6 py-4 text-slate-700">{businessRole.description ?? "-"}</td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-slate-900">
                            {linkedRoles.length} role{linkedRoles.length === 1 ? "" : "s"}
                          </span>
                          {linkedRoles.length ? (
                            <div className="flex flex-wrap gap-2">
                              {linkedRoles.slice(0, 3).map((role) => (
                                <span
                                  key={role.id}
                                  className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                                >
                                  {role.code}
                                </span>
                              ))}
                              {linkedRoles.length > 3 ? (
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                  +{linkedRoles.length - 3} more
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">No direct roles linked yet.</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(businessRole.active)}`}
                        >
                          {businessRole.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button size="small" variant="secondary" onClick={() => handleOpenEdit(businessRole)}>Edit</Button>
                          <Button size="small" variant="danger" onClick={() => setDeletingBusinessRole(businessRole)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BusinessRoleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitting={submitting}
        editingBusinessRole={editingBusinessRole}
      />

      <ConfirmDialog
        isOpen={!!deletingBusinessRole}
        title="Delete Business Role"
        message={
          deletingBusinessRole
            ? `Are you sure you want to delete ${deletingBusinessRole.code}?`
            : "Are you sure you want to delete this business role?"
        }
        onCancel={() => setDeletingBusinessRole(null)}
        onConfirm={handleDelete}
        isLoading={submitting}
        isDangerous
      />
    </AdminLayout>
  );
}
