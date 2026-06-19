import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { getSessionsByCourseId, createSession } from "@/features/courses/courseApi.ts";
import type { Session } from "@/features/courses/types.ts";
import { InputField } from "@/shared/components/form";
import { getApiErrorMessage } from "@/shared/api/error.ts";
import Modal from "@/shared/components/Modal.tsx";

const sessionSchema = z.object({
  sessionNo: z.number().min(1, "Session number must be at least 1"),
  title: z.string().min(1, "Title is required"),
  sessionDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  topic: z.string().optional(),
});

type SessionForm = z.infer<typeof sessionSchema>;

type Props = {
  courseId: number;
};

export default function SessionList({ courseId }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    void getSessionsByCourseId(courseId)
      .then((res) => setSessions(res.data ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  const fetchSessions = () => {
    void getSessionsByCourseId(courseId)
      .then((res) => setSessions(res.data ?? []))
      .catch(() => toast.error("Failed to refresh sessions"));
  };

  const onSubmit = (data: SessionForm) => {
    setSubmitting(true);
    void createSession(courseId, data)
      .then((res) => {
        toast.success(res.message ?? "Session created");
        setIsModalOpen(false);
        reset();
        fetchSessions();
      })
      .catch((err) => {
        toast.error(getApiErrorMessage(err, "Failed to create session"));
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading sessions...</div>;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Create Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-sm text-slate-500">No sessions found for this course.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Start</th>
                <th className="px-3 py-2">End</th>
                <th className="px-3 py-2">Topic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <tr key={s.id} className="text-slate-700 hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-900">{s.sessionNo}</td>
                  <td className="px-3 py-2">{s.title}</td>
                  <td className="px-3 py-2">{s.sessionDate}</td>
                  <td className="px-3 py-2">{s.startTime}</td>
                  <td className="px-3 py-2">{s.endTime}</td>
                  <td className="px-3 py-2">{s.topic ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title="Create Session"
        onClose={() => { setIsModalOpen(false); reset(); }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); reset(); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="session-form"
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        }
      >
        <form id="session-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Session No"
              type="number"
              {...register("sessionNo", { valueAsNumber: true })}
              error={errors.sessionNo?.message}
              id="sessionNo"
              required
            />
            <InputField
              label="Title"
              placeholder="Session title"
              {...register("title")}
              error={errors.title?.message}
              id="title"
              required
            />
          </div>
          <InputField
            label="Date"
            type="date"
            {...register("sessionDate")}
            error={errors.sessionDate?.message}
            id="sessionDate"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Start Time"
              type="time"
              {...register("startTime")}
              error={errors.startTime?.message}
              id="startTime"
              required
            />
            <InputField
              label="End Time"
              type="time"
              {...register("endTime")}
              error={errors.endTime?.message}
              id="endTime"
              required
            />
          </div>
          <InputField
            label="Topic"
            placeholder="Optional topic"
            {...register("topic")}
            error={errors.topic?.message}
            id="topic"
          />
        </form>
      </Modal>
    </>
  );
}
