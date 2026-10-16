import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            English Center
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
            Học tiếng Anh bài bản, luyện thi hiệu quả, giao tiếp tự tin.
          </p>
        </div>

        <div className="grid gap-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Khám phá
          </p>
          <a href="/#courses" className="transition hover:text-white">
            Khoá học
          </a>
          <a href="/#about-us" className="transition hover:text-white">
            Giới thiệu
          </a>
          <a href="/#why-us" className="transition hover:text-white">
            Vì sao chọn chúng tôi
          </a>
          <Link to="/contact" className="transition hover:text-white">
            Liên hệ
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          <p className="font-semibold text-white">Cần tư vấn chọn khoá học?</p>
          <p className="mt-2 leading-6 text-slate-400">
            Xem các khoá học đang mở hoặc vào tài khoản để tiếp tục việc học.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Xem khoá học
            </Link>
            <Link
              to="/account"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Tài khoản của tôi
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{new Date().getFullYear()} English Center. Bảo lưu mọi quyền.</p>
          <p>Học đều mỗi ngày, tự tin mỗi ngày.</p>
        </div>
      </div>
    </footer>
  );
}
