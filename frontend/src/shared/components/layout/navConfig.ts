export type NavIcon = "cal" | "users" | "classes" | "lib" | "account" | "tag" | "home" | "cards" | "bolt";

export type NavItem = { to: string; label: string; short: string; icon: NavIcon; end?: boolean };

/** Stroke paths (24x24 viewBox) shared by the sidebar and the mobile bottom nav. */
export const NAV_ICON_PATH: Record<NavIcon, string> = {
  tag: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01",
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  cal: "M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M3 10h18",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  classes: "M2 4h20v12H2zM8 20h8M12 16v4",
  lib: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  account: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  cards: "M3 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3zM7 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
  bolt: "M13 2 3 14h9l-1 8 10-12h-9z",
};

export const NAV: Record<"admin" | "teacher" | "student", { console: string; roleLabel: string; items: NavItem[] }> = {
  admin: {
    console: "Admin console",
    roleLabel: "Quản trị viên",
    items: [
      { to: "/admin/schedule", label: "Lịch giáo viên", short: "Lịch", icon: "cal" },
      { to: "/admin/users", label: "Người dùng", short: "Người dùng", icon: "users" },
      { to: "/admin/classes", label: "Lớp học", short: "Lớp", icon: "classes" },
      { to: "/admin/library", label: "Học liệu", short: "Học liệu", icon: "lib" },
      { to: "/admin/categories", label: "Danh mục", short: "Danh mục", icon: "tag" },
      { to: "/account", label: "Tài khoản", short: "Tôi", icon: "account" },
    ],
  },
  teacher: {
    console: "Teacher workspace",
    roleLabel: "Giáo viên",
    items: [
      { to: "/teacher/classes", label: "Lớp học", short: "Lớp", icon: "classes" },
      { to: "/teacher/schedule", label: "Lịch dạy", short: "Lịch", icon: "cal" },
      { to: "/teacher/flashcards", label: "Flashcard", short: "Thẻ", icon: "cards" },
      { to: "/teacher/word-rush", label: "Word Rush", short: "Rush", icon: "bolt" },
      { to: "/account", label: "Tài khoản", short: "Tôi", icon: "account" },
    ],
  },
  student: {
    console: "Student portal",
    roleLabel: "Học viên",
    items: [
      { to: "/student/flashcards", label: "Ôn thẻ", short: "Thẻ", icon: "cards" },
      { to: "/student/word-rush", label: "Word Rush", short: "Rush", icon: "bolt" },
      { to: "/student/schedule", label: "Lịch học", short: "Lịch", icon: "cal" },
      { to: "/account", label: "Tài khoản", short: "Tôi", icon: "account" },
    ],
  },
};
