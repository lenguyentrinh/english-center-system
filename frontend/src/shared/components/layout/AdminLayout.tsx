import type { PropsWithChildren } from "react";
import AppShell from "./AppShell";

/** `wide` is kept for old call sites; every layout is full-width now. */
export default function AdminLayout({ children }: PropsWithChildren<{ wide?: boolean }>) {
  return <AppShell role="admin">{children}</AppShell>;
}
