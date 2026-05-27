import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Course } from "@/features/courses/types.ts";
import { courseSchema, type CourseForm } from "@/features/courses/courseSchema.ts";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseForm) => void;
  submitting: boolean;
  editingClass?: Course | null;
}

const defaultValues: CourseForm = {
  code: "",
  name: "",
  startDate: "",
  endDate: "",
  maxStudent: 25,
  status: "OPEN",
};

export default function CourseModal({ isOpen, onClose, onSubmit, submitting, editingClass }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues,
  });

  const isEditing = !!editingClass;

  useEffect(() => {
    if (!isOpen) return;
    if (editingClass) {
      reset({
        code: editingClass.code,
        name: editingClass.name,
        startDate: editingClass.startDate,
        endDate: editingClass.endDate,
        maxStudent: editingClass.maxStudent,
        status: editingClass.status,
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, editingClass, reset]);

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