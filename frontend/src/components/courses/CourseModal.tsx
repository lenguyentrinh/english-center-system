import { useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Course } from "@/features/courses/types.ts";
import { courseSchema, type CourseForm } from "@/features/courses/courseSchema.ts";
import { getTeachers, type TeacherItem } from "@/features/teachers/teachersApi";
import { getRoles } from "@/features/admin/adminApi";
import type { RoleResponse } from "@/features/admin/types.ts";
import { InputField, SelectField, CheckboxField } from "@/shared/components/form";

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
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues,
    mode: "onBlur",
  });
  const isEditing = !!editingCourse;

  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [suggestedTeachers, setSuggestedTeachers] = useState<TeacherItem[]>([]);
  const [teacherRoles, setTeacherRoles] = useState<RoleResponse[]>([]);

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

  const availableRole = useWatch({ control, name: "availableRoleTeacher" });

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
            <InputField
              label="Code"
              placeholder="Course code"
              {...register("code")}
              error={errors.code?.message}
              id="code"
              required={true}
            />
          </div>
          <div>
            <InputField
              label="Name"
              placeholder="Course name"
              {...register("name")}
              error={errors.name?.message}
              id="name"
              required={true}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <InputField
                label="Start"
                type="date"
                {...register("startDate")}
                error={errors.startDate?.message}
                id="startDate"
                required={true}
              />
            </div>
            <div>
              <InputField
                label="End"
                type="date"
                {...register("endDate")}
                error={errors.endDate?.message}
                id="endDate"
                required={true}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <InputField
                label="Minimum age"
                type="number"
                {...register("minimumAge", { valueAsNumber: true })}
                error={errors.minimumAge?.message}
                id="minimumAge"
                required={true}
              />
            </div>
            <div>
              <InputField
                label="Entry level"
                placeholder="Required entry level"
                {...register("requiredEntryLevel")}
                error={errors.requiredEntryLevel?.message}
                id="requiredEntryLevel"
                required={true}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <CheckboxField
                label="Prerequisites required"
                error={errors.prerequisitesRequired?.message}
                id="prerequisitesRequired"
                {...register("prerequisitesRequired")}
              />
            </div>
            <div>
              <SelectField
                label="Available teacher role"
                error={errors.availableRoleTeacher?.message}
                options={teacherRoles.map(r => ({ value: r.code, label: r.description ?? r.code }))}
                {...register("availableRoleTeacher")}
                id="availableRoleTeacher"
                required={true}
              />
            </div>
          </div>
          <div>
            <label htmlFor="teacherId" className="text-sm font-medium text-slate-700">Teacher</label>
            <Controller
              control={control}
              name="teacherId"
              render={({ field }) => (
                <select
                  {...field}
                  id="teacherId"
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
            <InputField
              label="Max Students"
              type="number"
              {...register("maxStudent", { valueAsNumber: true })}
              error={errors.maxStudent?.message}
              id="maxStudent"
              required={true}
            />
          </div>
          <div>
            <SelectField
              label="Status"
              error={errors.status?.message}
              options={[
                { value: "OPEN", label: "OPEN" },
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "CLOSED", label: "CLOSED" },
              ]}
              {...register("status")}
              id="status"
              required={true}
            />
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