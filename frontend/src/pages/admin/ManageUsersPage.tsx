import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import { getUsers } from "@/features/admin/adminApi.ts";
import type { UserSummaryResponse } from "@/features/admin/types.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleString() : "-");

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to load users");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Manage Users
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Review accounts and open user detail pages to manage roles and business roles.
          </p>
        </div>
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
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Full name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Active</th>
                <th className="px-6 py-4 font-medium">Updated</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={8}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={8}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                    <td className="px-6 py-4 text-slate-700">{user.fullName ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{user.email ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{user.phone ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{user.status ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-700">{formatDate(user.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="inline-flex rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}