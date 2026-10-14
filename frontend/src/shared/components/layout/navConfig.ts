export type NavGroup = { title: string; items: { to: string; label: string; end?: boolean }[] };

export const NAV: Record<"admin" | "teacher" | "student", { console: string; groups: NavGroup[] }> = {
  admin: {
    console: "Admin console",
    groups: [
      {
        title: "Trung tâm",
        items: [
          { to: "/admin/dashboard", label: "Tổng quan" },
          { to: "/admin/schedule", label: "Lịch giáo viên" },
          { to: "/admin/users", label: "Manage Users" },
          { to: "/admin/library", label: "Học liệu" },
        ],
      },
      {
        title: "Quản trị",
        items: [
          { to: "/admin/courses", label: "Manage Course" },
          { to: "/admin/roles", label: "Manage Roles" },
          { to: "/admin/business-roles", label: "Manage Business Roles" },
        ],
      },
    ],
  },
  teacher: {
    console: "Teacher workspace",
    groups: [
      {
        title: "Giảng dạy",
        items: [
          { to: "/teacher/classes", label: "Lớp học" },
          { to: "/teacher/schedule", label: "Lịch dạy" },
          { to: "/teacher/flashcards", label: "Flashcard" },
          { to: "/teacher/word-rush", label: "Word Rush" },
        ],
      },
    ],
  },
  student: {
    console: "Student portal",
    groups: [
      {
        title: "Học tập",
        items: [
          { to: "/student", label: "Trang chủ", end: true },
          { to: "/student/classes", label: "Lớp học" },
          { to: "/student/flashcards", label: "Ôn thẻ" },
          { to: "/student/word-rush", label: "Word Rush" },
          { to: "/student/schedule", label: "Lịch học" },
        ],
      },
    ],
  },
};
