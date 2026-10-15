import StudentLayout from "@/shared/components/layout/StudentLayout";
import StudentWeek from "@/features/schedule/StudentWeek";

export default function StudentSchedulePage() {
  return (
    <StudentLayout>
      <StudentWeek />
    </StudentLayout>
  );
}
