import { Link, useParams, useSearchParams } from "react-router-dom";
import TeacherLayout from "@/shared/components/layout/TeacherLayout";
import { BackLink } from "@/shared/components/PageHeader";
import { useClass } from "@/features/classes";
import { DocsTab, SessionsTab, StudentsTab } from "@/features/classes/TeacherClassTabs";
import { fmtDM } from "@/features/classes/utils";

type Tab = "students" | "sessions" | "docs";
const TABS: Array<[Tab, string]> = [
  ["students", "Học viên"],
  ["sessions", "Buổi học"],
  ["docs", "Tài liệu"],
];

export default function TeacherClassDetailPage() {
  const { id } = useParams();
  const cls = useClass(id);
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab");
  const tab: Tab = rawTab === "sessions" || rawTab === "docs" ? rawTab : "students";

  if (!cls) {
    return (
      <TeacherLayout>
        <BackLink to="/teacher/classes">Lớp học của tôi</BackLink>
        <p className="mt-6 text-sm text-slate-600">
          Không tìm thấy lớp học. <Link to="/teacher/classes" className="font-bold underline underline-offset-4">Quay lại danh sách</Link>
        </p>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="flex flex-col gap-5">
        <section className="rounded-[22px] bg-[#e8f0ff] p-5 shadow-[0_0_0_1px_#d3e0fb]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <BackLink to="/teacher/classes">Lớp học của tôi</BackLink>
              <h1 className="text-[clamp(26px,3.4vw,34px)] font-black leading-tight tracking-tight text-slate-950">{cls.name}</h1>
              <span className="text-[13px] font-semibold text-slate-600">
                {cls.code} · {cls.teacherName ?? "—"} · {cls.room} · {fmtDM(cls.startDate)} – {fmtDM(cls.endDate)} · {cls.scheduleText}
              </span>
            </div>
            <div role="tablist" className="inline-flex gap-0.5 rounded-full bg-white/70 p-1">
              {TABS.map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setParams({ tab: k }, { replace: true })}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold ${tab === k ? "bg-white text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,.12)]" : "text-slate-600 hover:bg-slate-900/5"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {tab === "students" ? <StudentsTab cls={cls} /> : null}
        {tab === "sessions" ? <SessionsTab cls={cls} /> : null}
        {tab === "docs" ? <DocsTab cls={cls} /> : null}
      </div>
    </TeacherLayout>
  );
}
