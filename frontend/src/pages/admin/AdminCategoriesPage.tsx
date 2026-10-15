import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AdminLayout from "@/shared/components/layout/AdminLayout.tsx";
import ConfirmDialog from "@/shared/components/ConfirmDialog.tsx";
import Modal from "@/shared/components/Modal.tsx";
import PageHeader, { TableFrame, fieldClass, fieldErrClass, labelClass, outlineBtn, primaryBtn, rowClass, tdClass, thClass } from "@/shared/components/PageHeader.tsx";
import { Tag } from "@/shared/components/ui/Tag.tsx";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { createCategory, deleteCategory, updateCategory, type Category } from "@/features/categories/categoryApi.ts";
import { CATEGORIES_KEY, COLOR_SWATCHES, categoryColors, useCategories } from "@/features/categories/useCategories.ts";

type Editing = { id: string | null; name: string; color: string };

function CategoryModal({ value, onClose }: { value: Editing; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(value);
  const [tried, setTried] = useState(false);
  const nameErr = !form.name.trim() ? "Nhập tên danh mục." : form.name.trim().length > 40 ? "Tối đa 40 ký tự." : "";

  const save = useMutation({
    mutationFn: () => {
      const payload = { name: form.name.trim(), color: form.color };
      return form.id ? updateCategory(form.id, payload) : createCategory(payload);
    },
    onSuccess: () => {
      toast.success(form.id ? "Đã lưu danh mục" : "Đã thêm danh mục");
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      onClose();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Không lưu được danh mục")),
  });

  const c = categoryColors(form.color);
  return (
    <Modal isOpen title={form.id ? "Sửa danh mục" : "Thêm danh mục"} onClose={onClose} widthClassName="max-w-md">
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (nameErr) return setTried(true);
          save.mutate();
        }}
      >
        <div>
          <label htmlFor="cat-name" className={labelClass}>
            Tên danh mục
          </label>
          <input id="cat-name" autoFocus className={`${fieldClass} ${tried && nameErr ? fieldErrClass : ""}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="vd. IELTS, Tiếng Anh trẻ em, Luyện nghe" />
          {tried && nameErr ? <p className="mt-1 text-xs font-semibold text-rose-600">{nameErr}</p> : null}
        </div>
        <div>
          <span className={labelClass}>Màu</span>
          <div className="flex flex-wrap items-center gap-2">
            {COLOR_SWATCHES.map((s) => (
              <button key={s} type="button" aria-label={s} onClick={() => setForm({ ...form, color: s })} style={{ background: s }} className={`size-8 rounded-full ${form.color === s ? "ring-2 ring-offset-2 ring-slate-900" : ""}`} />
            ))}
            <input type="color" aria-label="Màu tuỳ chọn" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="size-8 cursor-pointer rounded-full border border-slate-200 bg-white p-0.5" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500">
          Xem trước:
          <Tag bg={c.bg} fg={c.fg}>
            {form.name.trim() || "Tên danh mục"}
          </Tag>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className={outlineBtn} onClick={onClose}>
            Huỷ
          </button>
          <button type="submit" className={primaryBtn} disabled={save.isPending}>
            {save.isPending ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { categories, isLoading } = useCategories();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [removing, setRemoving] = useState<Category | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Đã xoá danh mục");
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      setRemoving(null);
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Không xoá được danh mục (đang được dùng?)")),
  });

  return (
    <AdminLayout>
      <PageHeader
        crumb={`${categories.length} danh mục`}
        title="Danh mục"
        actions={
          <button type="button" className={primaryBtn} onClick={() => setEditing({ id: null, name: "", color: COLOR_SWATCHES[0] })}>
            + Thêm danh mục
          </button>
        }
      />
      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Danh mục là thẻ phân loại do trung tâm tự đặt (chương trình, kỹ năng, độ tuổi...). Dùng để gắn cho lớp học, học liệu, lịch và chuyên môn giáo viên.
      </p>
      <TableFrame>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thClass}>Danh mục</th>
              <th className={thClass}>Màu</th>
              <th className={thClass} />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={`${tdClass} text-slate-500`} colSpan={3}>
                  Đang tải…
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-500`} colSpan={3}>
                  Chưa có danh mục nào. Thêm danh mục đầu tiên để bắt đầu phân loại.
                </td>
              </tr>
            ) : (
              categories.map((c) => {
                const col = categoryColors(c.color);
                return (
                  <tr key={c.id} className={rowClass}>
                    <td className={tdClass}>
                      <Tag bg={col.bg} fg={col.fg}>
                        {c.name}
                      </Tag>
                    </td>
                    <td className={tdClass}>
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span style={{ background: col.solid }} className="size-4 rounded-full" />
                        {c.color}
                      </span>
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <span className="inline-flex gap-2">
                        <button type="button" className={outlineBtn} onClick={() => setEditing({ id: c.id, name: c.name, color: c.color })}>
                          Sửa
                        </button>
                        <button type="button" className={outlineBtn} onClick={() => setRemoving(c)}>
                          Xoá
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </TableFrame>

      {editing ? <CategoryModal value={editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog
        isOpen={removing !== null}
        title="Xoá danh mục"
        message={`Xoá “${removing?.name ?? ""}”? Danh mục đang được lớp học dùng sẽ không xoá được.`}
        confirmText="Xoá"
        cancelText="Huỷ"
        isDangerous
        isLoading={remove.isPending}
        onCancel={() => setRemoving(null)}
        onConfirm={() => removing && remove.mutate(removing.id)}
      />
    </AdminLayout>
  );
}
