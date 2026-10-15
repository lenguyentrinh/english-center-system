import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Modal from "@/shared/components/Modal.tsx";
import { fieldClass, fieldErrClass, labelClass, outlineBtn, primaryBtn } from "@/shared/components/PageHeader.tsx";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import { useCategories } from "@/features/categories/useCategories.ts";
import { getTeachers } from "@/features/teachers/teachersApi.ts";
import { conflictMessage } from "@/features/courses/courseApi.ts";
import { buildClassSchema, ENTRY_LEVELS, type ClassFormInput } from "@/features/courses/classSchema.ts";
import { DAY_SHORT, DAY_START, daysText, durText, endOptionsAfter, fmtMin, startOptions, toMin } from "@/features/courses/scheduleUi.ts";
import type { Course, UpsertCoursePayload } from "@/features/courses/types.ts";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Should reject with the raw axios error on failure; this modal shows the message / the schedule-conflict state. */
  onSubmit: (payload: UpsertCoursePayload) => Promise<unknown>;
  submitting: boolean;
  editing?: Course | null;
  /** Codes of all courses (the editing one is excluded by the caller). */
  codes: string[];
  /** Rooms already used by other classes, offered as suggestions (free text is still allowed). */
  rooms?: string[];
};

const blank: ClassFormInput = {
  code: "",
  name: "",
  categoryId: "",
  teacherId: "",
  room: "",
  days: [1, 3],
  start: 18 * 60 + 30,
  end: 20 * 60,
  startDate: "",
  endDate: "",
  maxStudent: 15,
  status: "OPEN",
  minimumAge: 0,
  requiredEntryLevel: "A1",
  prerequisitesRequired: false,
};

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}

export default function ClassFormModal({ isOpen, onClose, onSubmit, submitting, editing, codes, rooms = [] }: Props) {
  const isEdit = !!editing;
  const schema = useMemo(() => buildClassSchema(codes, !isEdit), [codes, isEdit]);
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<ClassFormInput>({
    resolver: zodResolver(schema),
    defaultValues: blank,
  });
  const { categories } = useCategories();
  // The conflict answer is only valid for the teacher/time it was computed for (`key`).
  const [conflictState, setConflictState] = useState<{ msg: string; key: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      reset({
        code: editing.code,
        name: editing.name,
        categoryId: editing.categoryId ?? "",
        teacherId: editing.teacher?.id ?? "",
        room: editing.room ?? "",
        days: editing.daysOfWeek?.length ? [...editing.daysOfWeek].sort() : blank.days,
        start: editing.startTime ? toMin(editing.startTime) : blank.start,
        end: editing.endTime ? toMin(editing.endTime) : blank.end,
        startDate: editing.startDate,
        endDate: editing.endDate,
        maxStudent: editing.maxStudent,
        status: editing.status,
        minimumAge: editing.minimumAge ?? 0,
        requiredEntryLevel: editing.requiredEntryLevel ?? "A1",
        prerequisitesRequired: editing.prerequisitesRequired ?? false,
      });
    } else {
      reset(blank);
    }
  }, [isOpen, editing, reset]);

  const [categoryId, teacherId, days, start, end, startDate, endDate] = useWatch({
    control,
    name: ["categoryId", "teacherId", "days", "start", "end", "startDate", "endDate"],
  });
  const room = useWatch({ control, name: "room" });
  const name = useWatch({ control, name: "name" });

  const conflictKey = JSON.stringify([teacherId, days, start, end, startDate, endDate]);
  const conflict = conflictState && conflictState.key === conflictKey ? conflictState.msg : null;

  const { data: teachersRes } = useQuery({ queryKey: ["teachers", "all"], queryFn: () => getTeachers(), enabled: isOpen, staleTime: 30_000 });
  const teachers = useMemo(() => {
    const all = teachersRes?.data ?? [];
    // Only teachers whose specialties include the category may teach it; no category = anyone.
    const list = categoryId ? all.filter((t) => t.categoryIds.includes(categoryId)) : all;
    if (editing?.teacher && !list.some((t) => t.id === editing.teacher!.id)) {
      return [...list, { id: editing.teacher.id, fullName: editing.teacher.fullName, categoryIds: [], roles: [] }];
    }
    return list;
  }, [teachersRes, editing, categoryId]);

  // Chosen teacher no longer qualifies after a category switch: clear it.
  useEffect(() => {
    if (teacherId && teachersRes && !teachers.some((t) => t.id === teacherId)) setValue("teacherId", "");
  }, [teachers, teacherId, teachersRes, setValue]);

  const toggleDay = (d: number) => {
    const next = days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort();
    setValue("days", next, { shouldValidate: true });
  };
  const changeStart = (v: number) => {
    // Keep the lesson length when the start moves.
    const len = end - start;
    setValue("start", v);
    setValue("end", Math.min(22 * 60, v + len), { shouldValidate: true });
  };

  const submit = handleSubmit(async (v) => {
    const payload: UpsertCoursePayload = {
      code: v.code.trim(),
      name: v.name.trim(),
      categoryId: v.categoryId || null,
      teacherId: v.teacherId || null,
      room: v.room.trim(),
      daysOfWeek: v.days,
      startTime: fmtMin(v.start),
      endTime: fmtMin(v.end),
      startDate: v.startDate,
      endDate: v.endDate,
      maxStudent: v.maxStudent,
      status: v.status,
      minimumAge: v.minimumAge,
      requiredEntryLevel: v.requiredEntryLevel,
      prerequisitesRequired: v.prerequisitesRequired,
      force: conflict ? true : undefined,
    };
    try {
      await onSubmit(payload);
      setConflictState(null);
    } catch (err) {
      const c = conflictMessage(err);
      if (c) setConflictState({ msg: c, key: conflictKey });
      else toast.error(getApiErrorMessage(err, isEdit ? "Không lưu được khoá học" : "Không tạo được khoá học"));
    }
  });

  const cls = (err?: unknown) => `${fieldClass} ${err ? fieldErrClass : ""}`;
  const codeReg = register("code");
  const teacherName = teachers.find((t) => t.id === teacherId)?.fullName;
  const preview = `${days.length ? daysText(days) : "Chưa chọn ngày"} · ${fmtMin(start)}–${fmtMin(end)}${room.trim() ? ` · ${room.trim()}` : ""}${teacherName ? ` · GV ${teacherName}` : ""}`;
  const submitLabel = submitting ? "Đang lưu…" : conflict ? (isEdit ? "Vẫn lưu thay đổi" : "Vẫn tạo khoá học") : isEdit ? "Lưu thay đổi" : "Tạo khoá học";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa khoá học" : "Tạo khoá học"}
      widthClassName="max-w-[620px]"
      subtitle={isEdit ? undefined : "Lớp mới sẽ hiện trong danh sách và lịch của giáo viên."}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" className={outlineBtn} onClick={onClose}>
            Huỷ
          </button>
          <button type="submit" form="class-form" className={primaryBtn} disabled={submitting}>
            {submitLabel}
          </button>
        </div>
      }
    >
      <form id="class-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2">
          <Field label="Tên khoá" error={errors.name?.message}>
            <input className={cls(errors.name)} placeholder="vd. IELTS 7.0 Intensive" {...register("name")} />
          </Field>
        </div>
        <Field label="Mã lớp" error={errors.code?.message}>
          <input
            className={cls(errors.code)}
            placeholder="vd. IELTS70"
            {...codeReg}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase().replace(/\s/g, "");
              void codeReg.onChange(e);
            }}
          />
        </Field>
        <Field label="Danh mục">
          <select className={cls()} {...register("categoryId")}>
            <option value="">Không phân loại</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label={categoryId ? "Giáo viên phụ trách (chỉ giáo viên có chuyên môn danh mục này)" : "Giáo viên phụ trách"} error={errors.teacherId?.message}>
            <select className={cls(errors.teacherId)} {...register("teacherId")}>
              <option value="">Chưa phân công</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName ?? `#${t.id}`}
                </option>
              ))}
            </select>
          </Field>
          {categoryId && teachersRes && teachers.length === 0 ? (
            <p className="mt-1 text-xs font-semibold text-amber-700">Chưa có giáo viên nào có chuyên môn này. Gán chuyên môn ở trang chi tiết người dùng.</p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <span className={labelClass}>Ngày học</span>
          <div className="flex flex-wrap gap-1.5">
            {DAY_SHORT.map((label, i) => {
              const d = i + 1;
              const on = days.includes(d);
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDay(d)}
                  className={`h-9 min-w-11 rounded-full border px-3 text-[13px] font-bold ${on ? "border-[#1f2937] bg-[#1f2937] text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {errors.days ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.days.message}</p> : null}
        </div>
        <Field label="Giờ bắt đầu">
          <select className={cls()} value={start} onChange={(e) => changeStart(Number(e.target.value))}>
            {startOptions.map((m) => (
              <option key={m} value={m}>
                {fmtMin(m)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Giờ kết thúc" error={errors.end?.message}>
          <select className={cls(errors.end)} value={end} onChange={(e) => setValue("end", Number(e.target.value), { shouldValidate: true })}>
            {endOptionsAfter(Math.max(start, DAY_START)).map((m) => (
              <option key={m} value={m}>
                {fmtMin(m)} · {durText(m - start)}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Phòng học" error={errors.room?.message}>
            <input className={cls(errors.room)} list="class-rooms" placeholder="vd. P.201 hoặc Online · Zoom" {...register("room")} />
            <datalist id="class-rooms">
              {[...new Set(rooms)].map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field label="Ngày bắt đầu" error={errors.startDate?.message}>
          <input type="date" className={cls(errors.startDate)} {...register("startDate")} />
        </Field>
        <Field label="Ngày kết thúc" error={errors.endDate?.message}>
          <input type="date" className={cls(errors.endDate)} {...register("endDate")} />
        </Field>
        <Field label="Sĩ số tối đa" error={errors.maxStudent?.message}>
          <input type="number" min={1} className={cls(errors.maxStudent)} {...register("maxStudent", { valueAsNumber: true })} />
        </Field>
        <Field label="Trạng thái" error={errors.status?.message}>
          <select className={cls(errors.status)} {...register("status")}>
            <option value="OPEN">Đang tuyển sinh</option>
            <option value="ACTIVE">Đang học</option>
            {isEdit ? <option value="CLOSE">Đã đóng</option> : null}
          </select>
        </Field>
        <Field label="Độ tuổi tối thiểu" error={errors.minimumAge?.message}>
          <input type="number" min={0} className={cls(errors.minimumAge)} {...register("minimumAge", { valueAsNumber: true })} />
        </Field>
        <Field label="Trình độ đầu vào" error={errors.requiredEntryLevel?.message}>
          <select className={cls(errors.requiredEntryLevel)} {...register("requiredEntryLevel")}>
            {ENTRY_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l.replace("_", "-")}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
          <input type="checkbox" className="size-4" {...register("prerequisitesRequired")} />
          Yêu cầu hoàn thành khoá tiên quyết
        </label>

        <p className="rounded-xl bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-600 sm:col-span-2">
          {name.trim() ? `${name.trim()} · ` : ""}
          {preview}
        </p>
        {conflict ? (
          <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-[13px] font-bold text-rose-700 sm:col-span-2">
            {conflict}. Nhấn “{isEdit ? "Vẫn lưu thay đổi" : "Vẫn tạo khoá học"}” nếu vẫn muốn lưu.
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
