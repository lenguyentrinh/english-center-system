import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import StudentLayout from "@/shared/components/layout/StudentLayout";
import PageHeader from "@/shared/components/PageHeader";
import { MOCK_STUDENT } from "@/features/mock/common";
import { useClass } from "@/features/classes";
import { DocsTable, MatesTable, SessionsTable, Tabs } from "@/features/classes/ClassParts";
import { TEACHER_NAMES } from "@/features/classes/utils";

type Tab = "sessions" | "docs" | "mates";

export default function StudentClassDetailPage() {
  const { id } = useParams();
  const cls = useClass(id);
  const [tab, setTab] = useState<Tab>("sessions");
  const allowed = cls?.students.some((s) => s.id === MOCK_STUDENT.id);

  return (
    <StudentLayout>
      {!cls || !allowed ? (
        <div>
          <Link to="/student/classes" className="text-[13px] font-semibold text-blue-600 hover:underline">
            ← Lớp của tôi
          </Link>
          <p className="mt-6 text-sm text-slate-600">Không tìm thấy lớp học.</p>
        </div>
      ) : (
        <>
          <PageHeader
            crumb={
              <Link to="/student/classes" className="text-blue-600 hover:underline">
                ← Lớp của tôi
              </Link>
            }
            title={cls.name}
          />
          <p className="-mt-3 mb-5 text-sm text-slate-600">
            {cls.code} · {TEACHER_NAMES[cls.teacherId] ?? "—"} · {cls.room} · {cls.scheduleText}
          </p>
          <Tabs
            tabs={[
              ["sessions", "Buổi học"],
              ["docs", "Tài liệu"],
              ["mates", "Bạn cùng lớp"],
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === "sessions" ? <SessionsTable cls={cls} editable={false} /> : null}
          {tab === "docs" ? <DocsTable cls={cls} editable={false} /> : null}
          {tab === "mates" ? <MatesTable cls={cls} /> : null}
        </>
      )}
    </StudentLayout>
  );
}
