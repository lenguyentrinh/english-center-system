import TeacherLayout from "@/shared/components/layout/TeacherLayout";
import WeekSchedule from "@/features/schedule/WeekSchedule";
import { MOCK_TEACHER } from "@/features/mock/common";

export default function TeacherSchedulePage() {
  return (
    <TeacherLayout wide>
      <WeekSchedule role="teacher" teacherId={MOCK_TEACHER.id} />
    </TeacherLayout>
  );
}
