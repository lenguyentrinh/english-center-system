import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/components/Modal.tsx";
import InputField from "@/shared/components/form/InputField.tsx";
import SelectField from "@/shared/components/form/SelectField.tsx";
import type { RoleResponse, RoleUpsertPayload } from "@/features/admin/types.ts";
import { roleCodeOptions } from "@/features/admin/constants.ts";
import { z } from "zod";

const roleSchema = z.object({
  code: z.enum([
    "ADMIN",
    "TEACHER",
    "STUDENT",
    "TEACHER_IELTS_6",
    "TEACHER_IELTS_7",
    "TEACHER_IELTS_8",
    "TEACHER_TOEIC_650",
    "TEACHER_TOEIC_750",
    "TEACHER_TOEIC_850",
  ]),
  description: z.string().max(500, "Description must be at most 500 characters").optional().or(z.literal("")),
  businessRoleId: z.string().optional().or(z.literal("")),
});

type RoleForm = z.infer<typeof roleSchema>;

const defaultValues: RoleForm = {
  code: "ADMIN",
  description: "",
  businessRoleId: "",
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RoleUpsertPayload) => void;
  submitting: boolean;
  editingRole?: RoleResponse | null;
  businessRoleOptions: { label: string; value: string }[];
};

export default function RoleModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  editingRole,
  businessRoleOptions,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues,
  });

  const isEditing = !!editingRole;

  useEffect(() => {
    if (!isOpen) return;

    if (editingRole) {
      reset({
        code: editingRole.code,
        description: editingRole.description ?? "",
        businessRoleId: editingRole.businessRoleId ? String(editingRole.businessRoleId) : "",
      });
    } else {
      reset(defaultValues);
    }
  }, [isOpen, editingRole, reset]);

  const submit = (values: RoleForm) => {
    onSubmit({
      code: values.code,
      description: values.description?.trim() || undefined,
      businessRoleId: values.businessRoleId ? Number(values.businessRoleId) : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? "Edit Role" : "Create Role"}
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
            form="role-form"
            disabled={submitting}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEditing ? "Update Role" : "Create Role"}
          </button>
        </div>
      }
    >
      <form id="role-form" className="space-y-4" onSubmit={handleSubmit(submit)}>
        <SelectField
          label="Code"
          options={roleCodeOptions}
          error={errors.code?.message}
          {...register("code")}
        />

        <InputField
          label="Description"
          placeholder="Role description"
          error={errors.description?.message}
          {...register("description")}
        />

        <SelectField
          label="Business Role"
          error={errors.businessRoleId?.message}
          options={[
            { label: "No business role", value: "" },
            ...businessRoleOptions,
          ]}
          {...register("businessRoleId")}
        />
      </form>
    </Modal>
  );
}