import TeacherLayout from "@/shared/components/layout/TeacherLayout";
import WeekSchedule from "@/features/schedule/WeekSchedule";

export default function TeacherSchedulePage() {
  return (
    <TeacherLayout wide>
      <WeekSchedule role="teacher" />
    </TeacherLayout>
  );
}
