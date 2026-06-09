import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/components/Modal.tsx";
import Button from "@/shared/components/Button.tsx";
import {InputField, SelectField } from "@/shared/components/form";
import type { RoleResponse, RoleUpsertPayload } from "@/features/admin/types.ts";
import { roleCodeOptions } from "@/features/admin/constants.ts";
import { roleSchema, defaultRoleValues, type RoleForm } from "@/features/admin/roleSchema.ts";

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
    defaultValues: defaultRoleValues,
    mode: "onBlur",
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
      reset(defaultRoleValues);
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
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="role-form" loading={submitting}>
            {submitting ? "Saving..." : isEditing ? "Update Role" : "Create Role"}
          </Button>
        </div>
      }
    >
      <form id="role-form" className="space-y-4" onSubmit={handleSubmit(submit)}>
        <SelectField
          id="code"
          label="Code"
          options={roleCodeOptions}
          error={errors.code?.message}
          {...register("code")}
          required={true}
        />

        <InputField
          id="description"
          label="Description"
          placeholder="Role description"
          error={errors.description?.message}
          {...register("description")}
        />

        <SelectField
          id="businessRoleId"
          label="Business Role"
          error={errors.businessRoleId?.message}
          options={[
            { label: "No business role", value: "" },
            ...businessRoleOptions,
          ]}
          {...register("businessRoleId")}
          required={true}
        />
      </form>
    </Modal>
  );
}