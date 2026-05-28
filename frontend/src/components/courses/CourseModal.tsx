import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Course } from "@/features/courses/types.ts";
import { courseSchema, type CourseForm } from "@/features/courses/courseSchema.ts";
import { getTeachers, type TeacherItem } from "@/features/teachers/teachersApi";
import { getRoles } from "@/features/admin/adminApi";
import type { RoleResponse } from "@/features/admin/types.ts";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseForm) => void;
  submitting: boolean;
  editingCourse?: Course | null;
}

const defaultValues: CourseForm = {
  code: "",
  name: "",
  startDate: "",
  endDate: "",
  maxStudent: 25,
  status: "OPEN",
  minimumAge: 0,
  requiredEntryLevel: "",
  prerequisitesRequired: false,
  availableRoleTeacher: "TEACHER",
  teacherId: undefined,
};

export default function CourseModal({ isOpen, onClose, onSubmit, submitting, editingCourse }: Props) {
  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues,
  });
  const isEditing = !!editingCourse;

  useEffect(() => {
    if (!isOpen) return;
    void Promise.all([getTeachers(), getRoles()])
      .then(([tRes, rRes]) => {
        setTeachers(tRes.data ?? []);
        // fetch teacher roles (roles with code starts with "TEACHER")
        const teacherRoles: RoleResponse[] = (rRes.data ?? []).filter((r: RoleResponse) => r.code.startsWith("TEACHER"));
        setTeacherRoles(teacherRoles);
      })
      .catch(() => {
        setTeachers([]);
        setTeacherRoles([]);
      });
    if (editingCourse) {
      reset({
        code: editingCourse.code,
        name: editingCourse.name,
        startDate: editingCourse.startDate,
        endDate: editingCourse.endDate,
        maxStudent: editingCourse.maxStudent,
        status: editingCourse.status,
        minimumAge: editingCourse.minimumAge ?? 0,
        requiredEntryLevel: editingCourse.requiredEntryLevel ?? "",
        prerequisitesRequired: editingCourse.prerequisitesRequired ?? false,
        teacherId: editingCourse.teacher?.id ?? undefined,
        availableRoleTeacher: editingCourse.availableRoleTeacher ?? "TEACHER",
      });
    } else {
      reset({ ...defaultValues, minimumAge: 0, requiredEntryLevel: "", prerequisitesRequired: false, availableRoleTeacher: "TEACHER" });
    }
  }, [isOpen, editingCourse, reset]);

  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [suggestedTeachers, setSuggestedTeachers] = useState<TeacherItem[]>([]);
  const [teacherRoles, setTeacherRoles] = useState<RoleResponse[]>([]);

  const availableRole = watch("availableRoleTeacher");

  // fetch suggested teachers when availableRole changes
  useEffect(() => {
    if (!availableRole) {
      setSuggestedTeachers([]);
      return;
    }
    void getTeachers(availableRole)
      .then((res) => setSuggestedTeachers(res.data ?? []))
      .catch(() => setSuggestedTeachers([]));
  }, [availableRole]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Edit Course" : "Create Course"}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div>
            <label className="text-sm font-medium text-slate-700">Code</label>
            <input {...register("code")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <p className="text-xs text-red-500">{errors.code?.message}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input {...register("name")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <p className="text-xs text-red-500">{errors.name?.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Start</label>
              <input type="date" {...register("startDate")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <p className="text-xs text-red-500">{errors.startDate?.message}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">End</label>
              <input type="date" {...register("endDate")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <p className="text-xs text-red-500">{errors.endDate?.message}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Minimum age</label>
              <input type="number" {...register("minimumAge", { valueAsNumber: true })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <p className="text-xs text-red-500">{errors.minimumAge?.message}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Entry level</label>
              <input {...register("requiredEntryLevel")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <p className="text-xs text-red-500">{errors.requiredEntryLevel?.message}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" {...register("prerequisitesRequired")} className="h-4 w-4" />
              <label className="text-sm font-medium text-slate-700">Prerequisites required</label>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">Available teacher role</label>
                <select {...register("availableRoleTeacher")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {teacherRoles.length === 0 ? (
                    <>
                      <option value="TEACHER">Teacher</option>
                      <option value="TEACHER_IELTS_6">IELTS 6.0</option>
                      <option value="TEACHER_IELTS_7">IELTS 7.0</option>
                      <option value="TEACHER_IELTS_8">IELTS 8.0</option>
                      <option value="TEACHER_TOEIC_650">TOEIC 650+</option>
                      <option value="TEACHER_TOEIC_750">TOEIC 750+</option>
                      <option value="TEACHER_TOEIC_850">TOEIC 850+</option>
                    </>
                  ) : (
                    teacherRoles.map((r) => (
                      <option key={r.id} value={r.code}>{r.description ?? r.code}</option>
                    ))
                  )}
                </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Teacher</label>
            <Controller
              control={control}
              name="teacherId"
              render={({ field }) => (
                <select
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">— None —</option>
                  {suggestedTeachers.length > 0 && (
                    <optgroup label="Suggested">
                      {suggestedTeachers.map((t) => (
                        <option key={`s-${t.id}`} value={t.id}>{t.fullName ?? `#${t.id}`}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="All teachers">
                    {teachers.filter(t => !suggestedTeachers.some(s => s.id === t.id)).map((t) => (
                      <option key={t.id} value={t.id}>{t.fullName ?? `#${t.id}`}</option>
                    ))}
                  </optgroup>
                </select>
              )}
            />
            <p className="text-xs text-red-500">{errors.teacherId?.message}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Max Students</label>
            <input type="number" {...register("maxStudent", { valueAsNumber: true })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <p className="text-xs text-red-500">{errors.maxStudent?.message}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select {...register("status")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="OPEN">OPEN</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg">
              {submitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}