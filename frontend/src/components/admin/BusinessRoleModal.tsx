import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/shared/components/Modal.tsx";
import InputField from "@/shared/components/form/InputField.tsx";
import type { BusinessRoleResponse, BusinessRoleUpsertPayload } from "@/features/admin/types.ts";
import { businessRoleCodeOptions } from "@/features/admin/constants.ts";

const businessRoleSchema = z.object({
  code: z.enum([
    "TOEIC_TEACHING_INTERMEDIATE",
    "TOEIC_TEACHING_ADVANCED",
    "IELTS_TEACHING_INTERMEDIATE",
    "IELTS_TEACHING_ADVANCED",
    "ENGLISH_COMMUNICATION_BASIC",
    "ENGLISH_COMMUNICATION_ADVANCED",
  ]),
  description: z.string().max(500, "Description must be at most 500 characters").optional().or(z.literal("")),
  active: z.boolean(),
});

type BusinessRoleForm = z.infer<typeof businessRoleSchema>;

const defaultValues: BusinessRoleForm = {
  code: "TOEIC_TEACHING_INTERMEDIATE",
  description: "",
  active: true,
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: BusinessRoleUpsertPayload) => void;
  submitting: boolean;
  editingBusinessRole?: BusinessRoleResponse | null;
};

export default function BusinessRoleModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  editingBusinessRole,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessRoleForm>({
    resolver: zodResolver(businessRoleSchema),
    defaultValues,
  });

  const isEditing = !!editingBusinessRole;

  useEffect(() => {
    if (!isOpen) return;

    if (editingBusinessRole) {
      reset({
        code: editingBusinessRole.code,
        description: editingBusinessRole.description ?? "",
        active: editingBusinessRole.active,
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, editingBusinessRole, reset]);

  const submit = (values: BusinessRoleForm) => {
    onSubmit({
      code: values.code,
      description: values.description?.trim() || undefined,
      active: values.active,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? "Edit Business Role" : "Create Business Role"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="business-role-form"
            disabled={submitting}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Update Business Role" : "Create Business Role"}
          </button>
        </div>
      }
    >
      <form id="business-role-form" className="space-y-4" onSubmit={handleSubmit(submit)}>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Code</label>
          <select
            {...register("code")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {businessRoleCodeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.code?.message ? <p className="text-xs text-red-500">{errors.code.message}</p> : null}
        </div>

        <InputField
          label="Description"
          placeholder="Business role description"
          error={errors.description?.message}
          {...register("description")}
        />

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register("active")} />
          Active
        </label>
      </form>
    </Modal>
  );
}