import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import ConfirmDialog from "@/shared/components/ConfirmDialog.tsx";
import {
  assignBusinessRoleToUser,
  assignTeacherToCourse,
  assignRoleToUser,
  getBusinessRoles,
  getRoles,
  getUserById,
  getUserEffectiveRoles,
  removeBusinessRoleFromUser,
  removeRoleFromUser,
  getBusinessRoleById,
} from "@/features/admin/adminApi.ts";
import { getTeacherByUserId } from "@/features/teachers/teachersApi";
import { getCoursesByTeacherUserId } from "@/features/teachers/teachersApi";
import type {
  BusinessRoleResponse,
  RoleResponse,
  UserEffectiveRolesResponse,
  UserSummaryResponse,
} from "@/features/admin/types.ts";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { statusBadgeClass } from "@/features/admin/constants.ts";

type RemovalTarget =
  | { kind: "role"; id: number; label: string; courses?: any[] }
  | { kind: "businessRole"; id: number; label: string; courses?: any[] }
  | null;

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleString() : "-");

const chipClass =
  "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700";

export default function UserDetailPage() {
  const { id } = useParams();
  const userId = Number(id);

  const [user, setUser] = useState<UserSummaryResponse | null>(null);
  const [effectiveRoles, setEffectiveRoles] = useState<UserEffectiveRolesResponse | null>(null);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [businessRoles, setBusinessRoles] = useState<BusinessRoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedBusinessRoleId, setSelectedBusinessRoleId] = useState("");
  const [removalTarget, setRemovalTarget] = useState<RemovalTarget>(null);
  const [suggestedModalOpen, setSuggestedModalOpen] = useState(false);
  const [suggestedCourses, setSuggestedCourses] = useState<any[]>([]);
  const [selectedSuggestedCourseIds, setSelectedSuggestedCourseIds] = useState<number[]>([]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const [userRes, effectiveRolesRes, rolesRes, businessRolesRes] = await Promise.all([
        getUserById(userId),
        getUserEffectiveRoles(userId),
        getRoles(),
        getBusinessRoles(),
      ]);
      setUser(userRes.data);
      setEffectiveRoles(effectiveRolesRes.data);
      setRoles(rolesRes.data);
      setBusinessRoles(businessRolesRes.data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to load user detail");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestedCourse = (courseId: number) => {
    setSelectedSuggestedCourseIds((prev) => {
      // remove if already selected, add if not selected
      if (prev.includes(courseId)) return prev.filter((id) => id !== courseId);
      
      // add to selection
      return [...prev, courseId];
    });
  };

  //
  const handleConfirmAssignSuggested = async () => {
    if (selectedSuggestedCourseIds.length === 0) {
      setSuggestedModalOpen(false);
      return;
    }

    try {
      setSubmitting(true);
      const teacherRes = await getTeacherByUserId(userId);
      const teacher = teacherRes.data;
      if (!teacher || !teacher.id) {
        toast.error("This user is not a teacher yet. Cannot assign to courses.");
        setSuggestedModalOpen(false);
        return;
      }

      for (const courseId of selectedSuggestedCourseIds) {
        try {
          await assignTeacherToCourse(courseId, teacher.id);
        } catch (err) {
          toast.error(getApiErrorMessage(err, `Failed to assign teacher to course ${courseId}`));
        }
      }
      toast.success("Assigned teacher to selected courses.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to assign suggested courses"));
    } finally {
      setSubmitting(false);
      setSuggestedModalOpen(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(userId)) {
      setError("Invalid user id");
      setLoading(false);
      return;
    }

    void loadDetail();
  }, [userId]);

  const effectiveRoleIds = useMemo(
    () => new Set(effectiveRoles?.effectiveRoles.map((role) => role.id) ?? []),
    [effectiveRoles]
  );
  const assignedBusinessRoleIds = useMemo(
    () => new Set(effectiveRoles?.businessRoles.map((businessRole) => businessRole.id) ?? []),
    [effectiveRoles]
  );

  const availableRoles = useMemo(
    () => roles.filter((role) => role.active && !effectiveRoleIds.has(role.id)),
    [roles, effectiveRoleIds]
  );

  const availableBusinessRoles = useMemo(
    () => businessRoles.filter((businessRole) => businessRole.active && !assignedBusinessRoleIds.has(businessRole.id)),
    [businessRoles, assignedBusinessRoleIds]
  );

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;

    try {
      setSubmitting(true);
      const res = await assignRoleToUser(userId, Number(selectedRoleId));
      toast.success(res.message);
      setSelectedRoleId("");
      await loadDetail();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to assign role"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignBusinessRole = async () => {
    if (!selectedBusinessRoleId) return;

    try {
      setSubmitting(true);
      const res = await assignBusinessRoleToUser(userId, Number(selectedBusinessRoleId));
      toast.success(res.message);
      setSelectedBusinessRoleId("");

      const suggestions = res.data ?? [];
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        setSuggestedCourses(suggestions);
        setSelectedSuggestedCourseIds(suggestions.map((s: any) => s.id));
        setSuggestedModalOpen(true);
      }

      // we only create the teacher server-side; do not open teacher-details modal
      await loadDetail();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to assign business role"));
    } finally {
      setSubmitting(false);
    }
  };

  const openRemovalConfirm = async (kind: "role" | "businessRole", id: number, label: string) => {
    try {
      const teacherRes = await getTeacherByUserId(userId);
      const teacher = teacherRes.data;

      // if no teacher record, nothing to unassign
      if (!teacher || !teacher.id) {
        setRemovalTarget({ kind, id, label });
        return;
      }

      // handle direct role removal
      if (kind === "role" && typeof label === "string" && label.startsWith("TEACHER")) {
        const courses = (await getCoursesByTeacherUserId(userId, [label])).data ?? [];
        setRemovalTarget({ kind, id, label, courses });
        return;
      }

      // handle business role removal
      if (kind === "businessRole") {
        const br = await getBusinessRoleById(id);
        const brRoles = br.data?.roles ?? [];
        const teacherCodes = brRoles.map((r:any) => r.code).filter(Boolean).filter((c:string) => c.startsWith("TEACHER"));
        if (!teacherCodes.length) {
          setRemovalTarget({ kind, id, label });
          return;
        }

        const courses = (await getCoursesByTeacherUserId(userId, teacherCodes)).data ?? [];
        setRemovalTarget({ kind, id, label, courses });
        return;
      }
    } catch (err) {
      // fallback to simple confirm on error — log for diagnostics
      // eslint-disable-next-line no-console
      console.error("openRemovalConfirm error:", err);
    }

    setRemovalTarget({ kind, id, label });
  };

  const handleRemove = async () => {
    if (!removalTarget) return;

    try {
      setSubmitting(true);
      if (removalTarget.kind === "role") {
        const res = await removeRoleFromUser(userId, removalTarget.id);
        toast.success(res.message);
      } else {
        const res = await removeBusinessRoleFromUser(userId, removalTarget.id);
        toast.success(res.message);
      }
      setRemovalTarget(null);
      await loadDetail();
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          removalTarget.kind === "role" ? "Failed to remove role" : "Failed to remove business role"
        )
      );
    } finally {
      setSubmitting(false);
    }
  };
  if (!Number.isFinite(userId)) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          Invalid user id.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link to="/admin/users" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
            Back to users
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            User Detail
          </h1>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-slate-500 shadow-sm">
          Loading user detail...
        </div>
      ) : user ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Username", user.username],
              ["Full name", user.fullName ?? "-"],
              ["Email", user.email ?? "-"],
              ["Phone", user.phone ?? "-"]
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Assigned Roles</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Direct roles assigned to this user.
                  </p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass[user.status ?? "ACTIVE"] ?? "bg-slate-100 text-slate-700"}`}>
                  {user.status ?? "UNKNOWN"}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                  {effectiveRoles?.directRoles.length ? (
                  effectiveRoles.directRoles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => void openRemovalConfirm("role", role.id, role.code)}
                      className={`${chipClass} cursor-pointer transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700`}
                    >
                      {role.code}
                      <span className="ml-2 text-rose-500">Remove</span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No direct roles assigned.</p>
                )}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-semibold text-slate-900">Assign Role</h3>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <select
                    value={selectedRoleId}
                    onChange={(event) => setSelectedRoleId(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select a role</option>
                    {availableRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.code} {role.description ? `- ${role.description}` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignRole}
                    disabled={!selectedRoleId || submitting}
                    className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Assign Role
                  </button>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Business Roles</h2>
              <p className="mt-1 text-sm text-slate-600">
                Assigning a business role also synchronizes the user’s effective roles.
              </p>

              <div className="mt-4 space-y-2">
                {effectiveRoles?.businessRoles.length ? (
                  effectiveRoles.businessRoles.map((businessRole) => (
                    <button
                      key={businessRole.id}
                      type="button"
                      onClick={() => void openRemovalConfirm("businessRole", businessRole.id, businessRole.code)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <span>{businessRole.code}</span>
                      <span>Remove</span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No business roles assigned.</p>
                )}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-semibold text-slate-900">Assign Business Role</h3>
                <div className="mt-3 space-y-3">
                  <select
                    value={selectedBusinessRoleId}
                    onChange={(event) => setSelectedBusinessRoleId(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select a business role</option>
                    {availableBusinessRoles.map((businessRole) => (
                      <option key={businessRole.id} value={businessRole.id}>
                        {businessRole.code}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignBusinessRole}
                    disabled={!selectedBusinessRoleId || submitting}
                    className="w-full rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Assign Business Role
                  </button>
                </div>
              </div>
            </article>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Effective Roles</h2>
            <p className="mt-1 text-sm text-slate-600">
              These are the final roles available to this user after direct and business-role assignments.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {effectiveRoles?.effectiveRoles.length ? (
                effectiveRoles.effectiveRoles.map((role) => (
                  <span key={role.id} className={chipClass}>
                    {role.code}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No effective roles yet.</p>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["Status", user.status ?? "-"],
                ["Created", formatDate(user.createdAt)],
                ["Updated", formatDate(user.updatedAt)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={!!removalTarget}
        title={removalTarget?.kind === "role" ? "Remove Role" : "Remove Business Role"}
        message={
          removalTarget ? (
            removalTarget.courses && removalTarget.courses.length > 0 ? (
              <div>
                <p>Are you sure you want to remove <strong>{removalTarget.label}</strong> from this user?</p>
                <p className="mt-2 font-semibold">Assigned courses:</p>
                <ul className="list-disc pl-5 mt-1">
                  {removalTarget.courses.map((c: any) => (
                    <li key={c.id} className="text-sm text-slate-700">{c.code} — {c.name}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-slate-600">Removing this role may affect course assignments.</p>
              </div>
            ) : (
              <div>
                <p>Are you sure you want to remove <strong>{removalTarget.label}</strong> from this user?</p>
              </div>
            )
          ) : (
            <div>
              <p>Are you sure you want to remove this assignment?</p>
            </div>
          )
        }
        onCancel={() => setRemovalTarget(null)}
        onConfirm={handleRemove}
        isLoading={submitting}
        isDangerous
      />

      {suggestedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Assign Teacher to Matching Courses</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-slate-600">These courses match the newly added teacher roles. Select which courses to assign this teacher to.</p>
              <div className="mt-4 max-h-64 overflow-auto">
                {suggestedCourses.map((s) => (
                  <label key={s.id} className="flex items-center gap-3 border-b border-slate-100 px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedSuggestedCourseIds.includes(s.id)}
                      onChange={() => toggleSuggestedCourse(s.id)}
                      className="h-4 w-4"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{s.code} — {s.name}</div>
                      <div className="text-xs text-slate-500">Required teacher role: {s.availableRoleTeacher}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button onClick={() => setSuggestedModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg">Cancel</button>
              <button onClick={handleConfirmAssignSuggested} disabled={submitting} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">{submitting ? 'Assigning...' : 'Assign Selected'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}