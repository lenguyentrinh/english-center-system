export const ANSWER_COLORS = [
  { bg: "#2563eb", fg: "#fff" },
  { bg: "#0891b2", fg: "#fff" },
  { bg: "#f59e0b", fg: "#1c1917" },
  { bg: "#ea580c", fg: "#fff" },
] as const;
export const LETTERS = ["A", "B", "C", "D"] as const;
export const TEACHER_ROLES = ["TEACHER", "TEACHER_IELTS_6", "TEACHER_IELTS_7", "TEACHER_IELTS_8", "TEACHER_TOEIC_650", "TEACHER_TOEIC_750", "TEACHER_TOEIC_850"];
export const STUDENT_ROLES = ["STUDENT"];
export const fmtPin = (p: string) => `${p.slice(0, 3)} ${p.slice(3)}`;
