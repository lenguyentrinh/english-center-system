import type { ClassDoc, ClassItem, ClassSession, ClassStudent, DocType } from "./types";
import { addDays, periodRange } from "./utils";
import { MOCK_NOW } from "@/features/mock/common";

const PEOPLE: Array<[string, string, string, string]> = [
  ["s1", "Lê Minh Anh", "minhanh.le@gmail.com", "0987 220 115"],
  ["s2", "Hoàng Nam", "hoangnam.dev@gmail.com", "0905 661 230"],
  ["s3", "Võ Anh Thư", "anhthu.vo@gmail.com", "0919 845 002"],
  ["s4", "Đặng Khánh Linh", "khanhlinh@gmail.com", "0944 770 361"],
  ["s5", "Gia Bảo", "giabao.ng@gmail.com", "0938 112 504"],
  ["s6", "Quốc Huy", "quochuy.tr@gmail.com", "0977 431 220"],
  ["s7", "Mai Chi", "maichi.p@gmail.com", "0903 556 781"],
  ["s8", "Tuấn Kiệt", "tuankiet@yahoo.com", "0962 304 118"],
  ["s9", "Ngọc Hân", "ngochan.v@gmail.com", "0916 870 443"],
  ["s10", "Đức Anh", "ducanh.do@gmail.com", "0935 227 690"],
  ["s11", "Bảo Ngọc", "baongoc.l@gmail.com", "0948 601 335"],
  ["s12", "Minh Khoa", "minhkhoa.h@gmail.com", "0971 095 826"],
];

const LAST = ["Hôm nay", "Hôm qua", "2 ngày trước", "Hôm nay", "3 ngày trước"];

function students(list: typeof PEOPLE, seed: number): ClassStudent[] {
  return list.map(([id, name, email, phone], i) => {
    const k = (i + 1) * 37 + seed * 11;
    return {
      id,
      name,
      email,
      phone,
      att: 78 + (k % 22),
      fc: 40 + ((k * 7) % 60),
      rush: 2000 + ((k * 131) % 7000),
      last: LAST[(i + seed) % LAST.length],
    };
  });
}

function doc(id: string, name: string, type: DocType, size: string, by: string, date: string, note: string, url = ""): ClassDoc {
  return { id, name, type, size, url, by, date, note };
}

function session(id: string, dayOffset: number, startPeriod: number, periods: number, room: string, topic: string, no: number, docIds: string[]): ClassSession {
  const r = periodRange(startPeriod, periods);
  return { id, date: addDays(MOCK_NOW.weekStart, dayOffset), startPeriod, periods, start: r.start, end: r.end, room, topic, no, docIds };
}

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: "c1",
    name: "IELTS 7.0 Intensive",
    code: "IELTS7A",
    teacherId: "t1",
    room: "P.201",
    scheduleText: "T2 · T4 · T6 · Tiết 11–13 · 18:30–20:45",
    startDate: "2026-09-01",
    endDate: "2026-12-20",
    status: "ACTIVE",
    category: "IELTS",
    students: students(PEOPLE, 1),
    docs: [
      doc("d1", "Unit 6 · Environment · Reading", "PDF", "2,4 MB", "Cô Lan Anh", "12/10", "Làm trước buổi thứ Tư"),
      doc("d2", "Listening Section 3 · audio", "AUDIO", "18 MB", "Cô Lan Anh", "09/10", "3 lượt nghe, ghi đáp án vào phiếu"),
      doc("d3", "Writing Task 2 · bài mẫu band 7.5", "PDF", "640 KB", "Cô Lan Anh", "05/10", ""),
      doc("d4", "Cambridge IELTS 18 · Test 2", "LINK", "—", "Cô Lan Anh", "01/10", "Làm thử tại nhà, có đáp án", "https://example.com/cambridge-ielts-18"),
    ],
    sessions: [
      session("ses1", 0, 11, 3, "P.201", "Unit 6 · Reading", 19, ["d1"]),
      session("ses2", 2, 11, 3, "P.201", "Unit 6 · Listening", 20, ["d2"]),
      session("ses3", 4, 11, 3, "P.201", "Unit 6 · Writing Task 2", 21, ["d3", "d4"]),
    ],
  },
  {
    id: "c2",
    name: "IELTS 8.0 Mastery",
    code: "IELTS8",
    teacherId: "t1",
    room: "P.203",
    scheduleText: "T7 · Tiết 1–4 · 07:00–10:20",
    startDate: "2026-05-01",
    endDate: "2026-08-30",
    status: "CLOSED",
    category: "IELTS",
    students: students(PEOPLE.slice(4, 12), 2),
    docs: [doc("d5", "Tổng kết khoá · đề thi cuối", "PDF", "1,1 MB", "Cô Lan Anh", "28/08", "")],
    sessions: [],
  },
  {
    id: "c3",
    name: "Giao tiếp cơ bản",
    code: "COM-B1",
    teacherId: "t2",
    room: "P.102",
    scheduleText: "T3 · T6 · T7 · Tiết 6–7 · 13:00–14:35",
    startDate: "2026-09-15",
    endDate: "2026-12-15",
    status: "OPEN",
    category: "Giao tiếp",
    students: students(
      PEOPLE.filter((_, i) => i % 2 === 0 || i === 1),
      3,
    ),
    docs: [
      doc("d6", "Mẫu câu hẹn gặp bạn bè", "PDF", "520 KB", "Lê Trinh", "10/10", "Đọc to theo cặp"),
      doc("d7", "Video · Small talk ở quán cà phê", "VIDEO", "64 MB", "Lê Trinh", "06/10", ""),
    ],
    sessions: [
      session("ses4", 1, 6, 2, "P.102", "Hẹn gặp bạn bè", 12, ["d6"]),
      session("ses5", 4, 6, 2, "P.102", "Small talk ở quán cà phê", 13, ["d7"]),
      session("ses6", 5, 6, 2, "P.102", "Luyện nói theo cặp", 14, []),
    ],
  },
  {
    id: "c4",
    name: "TOEIC 750 Booster",
    code: "TOEIC-750",
    teacherId: "t1",
    room: "P.105",
    scheduleText: "T3 · T5 · Tiết 10–12 · 17:45–20:00",
    startDate: "2026-10-01",
    endDate: "2027-01-31",
    status: "OPEN",
    category: "TOEIC",
    students: students(PEOPLE.slice(1, 8), 4),
    docs: [doc("d8", "Part 5 · Giới từ · bài tập", "PDF", "300 KB", "Cô Lan Anh", "08/10", "")],
    sessions: [session("ses7", 3, 10, 3, "P.105", "Part 5 · Giới từ", 6, ["d8"])],
  },
];
