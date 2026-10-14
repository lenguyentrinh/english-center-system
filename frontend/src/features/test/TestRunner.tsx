import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type TestQuestion = {
  id: string;
  sentence: string; // contains ___
  options: string[]; // 4
  answer: number;
  explain?: string;
};

export type TestResult = { correct: number; total: number; seconds: number; answers: (number | null)[] };

type Props = {
  title: string;
  description?: string;
  questions: TestQuestion[];
  minutes: number;
  onFinish?: (r: TestResult) => void;
  onExit: () => void;
};

const LETTERS = ["A", "B", "C", "D"];
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function Sentence({ text, filled }: { text: string; filled?: string | null }) {
  const parts = text.split("___");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 ? (
            <span
              className={`mx-1 inline-block min-w-[56px] rounded-lg px-2 py-0.5 text-center ${filled ? "bg-blue-100 text-blue-800" : "border border-dashed border-slate-300 text-slate-400"}`}
            >
              {filled ?? "?"}
            </span>
          ) : null}
        </span>
      ))}
    </>
  );
}

/** Shared 4-option test (Word Rush "test" mode and flashcard tests). */
export default function TestRunner({ title, description, questions, minutes, onFinish, onExit }: Props) {
  const total = questions.length;
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [left, setLeft] = useState(Math.max(1, Math.round(minutes * 60)));
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const answersRef = useRef(answers);
  const doneRef = useRef(false);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const submit = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const used = Math.min(Math.round(minutes * 60), Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
    const a = answersRef.current;
    const right = a.filter((v, i) => v === questions[i].answer).length;
    setSeconds(used);
    setDone(true);
    onFinish?.({ correct: right, total, seconds: used, answers: a });
  }, [minutes, onFinish, questions, total, startedAt]);

  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => setLeft((l) => l - 1), 1000);
    return () => window.clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (!done && left <= 0) submit();
  }, [left, done, submit]);

  const answered = answers.filter((v) => v !== null).length;
  const correct = useMemo(() => answers.filter((v, i) => v === questions[i].answer).length, [answers, questions]);
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const remark = pct >= 80 ? "Rất tốt" : pct >= 50 ? "Khá ổn, xem lại câu sai" : "Cần ôn thêm";

  const pick = (qi: number, oi: number) => {
    if (done) return;
    setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)));
  };
  const jump = (i: number) => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  const gridClass = (i: number) => {
    if (!done) return answers[i] !== null ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600";
    if (answers[i] === null) return "bg-slate-200 text-slate-500";
    return answers[i] === questions[i].answer ? "bg-emerald-500 text-white" : "bg-rose-500 text-white";
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-0 z-20 -mx-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/95 px-2 py-3 backdrop-blur">
        <div className="min-w-0">
          <h2 className="truncate text-[20px] font-extrabold tracking-tight text-slate-950">{title}</h2>
          {description ? <p className="truncate text-[13px] font-semibold text-slate-500">{description}</p> : null}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-bold text-slate-600 tabular-nums">
            Đã làm {answered}/{total}
          </span>
          {!done ? (
            <>
              <span className={`text-[22px] font-black tabular-nums ${left < 60 ? "text-rose-600" : "text-slate-950"}`}>{mmss(Math.max(0, left))}</span>
              <button type="button" onClick={submit} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                Nộp bài
              </button>
            </>
          ) : (
            <button type="button" onClick={onExit} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
              Đóng
            </button>
          )}
        </div>
      </div>

      {done ? (
        <div className="flex flex-wrap items-end gap-x-8 gap-y-2 border-b border-slate-200 pb-5">
          <span className="text-[80px] font-black leading-none tabular-nums text-slate-950">
            {correct}/{total}
          </span>
          <div className="pb-2">
            <p className="text-[22px] font-extrabold text-slate-950">
              {pct}% · {remark}
            </p>
            <p className="text-[13px] font-semibold text-slate-500">
              Thời gian đã làm {mmss(seconds)} · Đúng {correct} · Sai {answers.filter((v, i) => v !== null && v !== questions[i].answer).length} · Bỏ trống {total - answered}. Kết quả đã gửi về giáo viên.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start gap-6">
        <div className="sticky top-[84px] grid w-[220px] shrink-0 grid-cols-5 gap-2 self-start">
          {questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => jump(i)}
              className={`h-9 rounded-lg text-[13px] font-bold tabular-nums ${gridClass(i)}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <ol className="m-0 min-w-0 flex-1 basis-[420px] list-none divide-y divide-slate-200 p-0">
          {questions.map((q, i) => {
            const a = answers[i];
            const verdict = done ? (a === null ? "blank" : a === q.answer ? "ok" : "bad") : null;
            return (
              <li key={q.id} ref={(el) => { refs.current[i] = el; }} className="flex scroll-mt-28 flex-col gap-3 py-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[13px] font-black text-slate-400 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <p className="flex-1 text-[17px] font-bold leading-relaxed text-slate-950">
                    <Sentence text={q.sentence} filled={a !== null ? q.options[a] : null} />
                  </p>
                  {verdict ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[12px] font-extrabold ${verdict === "ok" ? "bg-emerald-100 text-emerald-800" : verdict === "bad" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {verdict === "ok" ? "Đúng" : verdict === "bad" ? "Sai" : "Bỏ trống"}
                    </span>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 gap-2 pl-8 sm:grid-cols-2">
                  {q.options.map((o, oi) => {
                    const chosen = a === oi;
                    let cls = chosen ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50";
                    if (done && oi === q.answer) cls = "border-emerald-500 bg-emerald-50";
                    else if (done && chosen) cls = "border-rose-500 bg-rose-50";
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={done}
                        onClick={() => pick(i, oi)}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold text-slate-800 ${cls}`}
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-black text-slate-600">{LETTERS[oi]}</span>
                        {o}
                      </button>
                    );
                  })}
                </div>
                {done ? (
                  <p className="pl-8 text-[13px] font-semibold text-slate-600">
                    Đáp án đúng: <b className="text-emerald-700">{q.options[q.answer]}</b>
                    {q.explain ? <> · {q.explain}</> : null}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      {!done ? (
        <div className="flex justify-center border-t border-slate-200 pt-5">
          <button type="button" onClick={submit} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800">
            Nộp bài{total - answered > 0 ? ` · còn ${total - answered} câu chưa làm` : ""}
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <button type="button" onClick={onExit} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Quay lại
          </button>
        </div>
      )}
    </div>
  );
}
