import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/components/Modal.tsx";
import type { BusinessRoleResponse, BusinessRoleUpsertPayload } from "@/features/admin/types.ts";
import { businessRoleCodeOptions } from "@/features/admin/constants.ts";
import { businessRoleSchema, defaultBusinessRoleValues, type BusinessRoleForm } from "@/features/admin/businessRoleSchema.ts";
import Button from "@/shared/components/Button.tsx";
import { CheckboxField, InputField, SelectField } from "@/shared/components/form";

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
    defaultValues: defaultBusinessRoleValues,
    mode: "onBlur",
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
      reset(defaultBusinessRoleValues);
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
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="business-role-form" loading={submitting}>
            {submitting ? "Saving..." : isEditing ? "Update Business Role" : "Create Business Role"}
          </Button>
        </div>
      }
    >
      <form id="business-role-form" className="space-y-4" onSubmit={handleSubmit(submit)}>
        <div className="space-y-1">
          <SelectField
            label="Code"
            error={errors.code?.message}
            options={businessRoleCodeOptions}
            {...register("code")}
            id="code"
            required={true}
          />
        </div> 

        <InputField
          id="description"
          label="Description"
          placeholder="Business role description"
          error={errors.description?.message}
          {...register("description")}
        />

        <CheckboxField
          id="active"
          label="Active"
          {...register("active")}
        />
      </form>
    </Modal>
  );
}