import StudentLayout from "@/shared/components/layout/StudentLayout";
import WeekSchedule from "@/features/schedule/WeekSchedule";

export default function StudentSchedulePage() {
  return (
    <StudentLayout wide>
      <WeekSchedule role="student" />
    </StudentLayout>
  );
}
