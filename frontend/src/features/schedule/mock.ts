import { MOCK_TEACHER } from "@/features/mock/common";
import type { MockTeacher, ScheduleEvent } from "./types";

export const TEACHERS: MockTeacher[] = [
  { id: MOCK_TEACHER.id, name: MOCK_TEACHER.name, roleCode: "TEACHER_IELTS_8" },
  { id: "t2", name: "Trần Minh", roleCode: "TEACHER_TOEIC_850" },
  { id: "t3", name: "Phạm Lan", roleCode: "TEACHER_IELTS_7" },
  { id: "t4", name: "Lê Trinh", roleCode: "TEACHER" },
  { id: "t5", name: "Đỗ Quân", roleCode: "TEACHER_TOEIC_750" },
];

/** Classes the mock student (s1) belongs to. */
export const STUDENT_CLASS_IDS = ["c1", "c3"];

export const COURSE_OPTIONS: { name: string; category: ScheduleEvent["category"] }[] = [
  { name: "IELTS 7.0 Intensive", category: "IELTS" },
  { name: "IELTS 6.5 Foundation", category: "IELTS" },
  { name: "TOEIC 650 Booster", category: "TOEIC" },
  { name: "TOEIC 750 Online", category: "TOEIC" },
  { name: "Giao tiếp cơ bản", category: "Giao tiếp" },
];

export const TEACHER_ROOMS = ["P.102", "P.105", "P.201", "P.203", "Hội trường", "Online · Zoom"];
export const STUDENT_ROOMS = ["Ở nhà", "Thư viện trung tâm", "Online"];

type Cat = ScheduleEvent["category"];
const D = ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18"];
let n = 0;
const E = (d: number, start: string, end: string, title: string, category: Cat, meta: string, teacherId = "t1", classId?: string): ScheduleEvent => ({
  id: `mock-${++n}`,
  date: D[d],
  start,
  end,
  title,
  category,
  meta,
  teacherId,
  classId,
  owner: "staff",
});

export const INITIAL_EVENTS: ScheduleEvent[] = [
  E(0, "08:30", "10:00", "Kèm 1-1 · Minh Anh", "IELTS", "Online · Speaking band 7", "t1", "c1"),
  E(0, "12:00", "13:00", "Họp chuyên môn", "Cá nhân", "Phòng giáo viên"),
  E(0, "18:30", "20:30", "IELTS 7.0 Intensive", "IELTS", "P.201 · 12 học viên", "t1", "c1"),
  E(1, "08:00", "09:15", "Chấm bài Writing", "Cá nhân", "Task 2 · lớp IELTS65"),
  E(1, "09:30", "11:00", "TOEIC 650 Booster", "TOEIC", "P.105 · 16 học viên", "t2", "c4"),
  E(1, "13:15", "14:45", "Giao tiếp cơ bản", "Giao tiếp", "P.102 · 10 học viên", "t4", "c3"),
  E(1, "17:45", "19:15", "IELTS 6.5 Foundation", "IELTS", "P.203 · 14 học viên", "t3", "c5"),
  E(2, "07:30", "08:15", "Soạn giáo án", "Cá nhân", "Unit 6 · Listening"),
  E(2, "09:00", "10:30", "Kèm 1-1 · Hoàng Nam", "TOEIC", "Online · Part 5–6", "t2"),
  E(2, "18:30", "20:30", "IELTS 7.0 Intensive", "IELTS", "P.201 · 12 học viên", "t1", "c1"),
  E(3, "09:30", "11:00", "TOEIC 650 Booster", "TOEIC", "P.105 · 16 học viên", "t2", "c4"),
  E(3, "16:00", "17:00", "Phỏng vấn giáo viên", "Cá nhân", "Phòng HR"),
  E(3, "16:30", "18:00", "TOEIC 750 Online", "TOEIC", "Zoom · 20 học viên", "t5", "c2"),
  E(3, "19:00", "20:30", "IELTS 6.5 Foundation", "IELTS", "P.203 · 14 học viên", "t3", "c5"),
  E(4, "08:30", "10:00", "Kèm 1-1 · Minh Anh", "IELTS", "Online · Speaking band 7", "t1", "c1"),
  E(4, "14:00", "15:30", "Giao tiếp cơ bản", "Giao tiếp", "P.102 · 10 học viên", "t4", "c3"),
  E(4, "18:30", "20:30", "IELTS 7.0 Intensive", "IELTS", "P.201 · 12 học viên", "t1", "c1"),
  E(5, "08:00", "11:30", "Thi thử IELTS", "IELTS", "Hội trường · 40 thí sinh", "t1", "c1"),
  E(5, "14:00", "15:30", "Giao tiếp cơ bản", "Giao tiếp", "P.102 · 10 học viên", "t4", "c3"),
  E(6, "09:00", "10:00", "Việc riêng", "Cá nhân", ""),
  E(2, "12:00", "13:00", "Họp tổ TOEIC", "Cá nhân", "Phòng giáo viên", "t2"),
  E(3, "14:00", "15:30", "Chấm bài thi thử", "Cá nhân", "Part 7", "t3"),
  E(4, "09:00", "10:30", "TOEIC 750 Online", "TOEIC", "Zoom · 20 học viên", "t5", "c2"),
  { id: "mock-self-1", date: D[2], start: "20:45", end: "21:30", title: "Tự học", category: "Cá nhân", meta: "Ở nhà", owner: "student", custom: true },
];
