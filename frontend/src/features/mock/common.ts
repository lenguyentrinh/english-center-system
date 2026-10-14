/** Shared mock context for features that have no backend yet (prototype data from fix/README.md). */
export const MOCK_NOW = { date: "2026-10-13", time: "14:20", weekNo: 42, weekStart: "2026-10-12", weekEnd: "2026-10-18" } as const;

export const MOCK_TEACHER = { id: "t1", name: "Cô Lan Anh" } as const;
export const MOCK_STUDENT = { id: "s1", name: "Minh Anh" } as const;

export type MockClassRef = { id: string; name: string; code: string; category: "IELTS" | "TOEIC" | "Giao tiếp" };

export const MOCK_CLASS_REFS: MockClassRef[] = [
  { id: "c1", name: "IELTS 7.0 Intensive", code: "IELTS-701", category: "IELTS" },
  { id: "c2", name: "TOEIC 750 Booster", code: "TOEIC-750", category: "TOEIC" },
  { id: "c3", name: "Giao tiếp cơ bản", code: "GT-101", category: "Giao tiếp" },
];

export const CATEGORY_STYLE = {
  IELTS: { bg: "#eff6ff", text: "#1e40af", solid: "#2563eb" },
  TOEIC: { bg: "#ecfeff", text: "#155e75", solid: "#0891b2" },
  "Giao tiếp": { bg: "#ecfdf5", text: "#065f46", solid: "#059669" },
  "Cá nhân": { bg: "#f1f5f9", text: "#334155", solid: "#64748b" },
} as const;
export type Category = keyof typeof CATEGORY_STYLE;
