import { useState } from "react";

type Question = {
  sentence: string; // contains "___"
  answers: [string, string, string, string];
  correct: number;
  explanation: string;
};

const QUESTIONS: Question[] = [
  {
    sentence: "Practice makes ___.",
    answers: ["perfect", "perfectly", "perfection", "perfected"],
    correct: 0,
    explanation: "Thành ngữ: có công mài sắt, có ngày nên kim.",
  },
  {
    sentence: "I have studied here ___ 2024.",
    answers: ["for", "since", "during", "from"],
    correct: 1,
    explanation: "“since” đi với mốc thời gian.",
  },
  {
    sentence: "She is good ___ speaking.",
    answers: ["in", "on", "at", "with"],
    correct: 2,
    explanation: "“good at” + V-ing.",
  },
  {
    sentence: "Let's ___ a break.",
    answers: ["make", "take", "do", "have got"],
    correct: 1,
    explanation: "Collocation: take a break.",
  },
];

const LETTERS = ["A", "B", "C", "D"];
const TILE_COLORS = ["bg-[#2563eb] text-white", "bg-[#0891b2] text-white", "bg-[#f59e0b] text-[#1c1917]", "bg-[#ea580c] text-white"];

export default function WarmupQuiz() {
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const q = QUESTIONS[qi];
  const answered = pick !== null;
  const isCorrect = pick === q.correct;
  const [before, after] = q.sentence.split("___");

  const choose = (index: number) => {
    if (answered) return;
    setPick(index);
    if (index === q.correct) setScore((value) => value + 1000);
  };

  const next = () => {
    setQi((value) => (value + 1) % QUESTIONS.length);
    setPick(null);
  };

  const blankStyle = !answered
    ? "border-[#60a5fa] bg-[rgba(59,130,246,.22)] text-[#93c5fd]"
    : isCorrect
      ? "border-[#10b981] bg-[rgba(16,185,129,.22)] text-[#6ee7b7]"
      : "border-[#f43f5e] bg-[rgba(244,63,94,.22)] text-[#fda4af]";

  return (
    <section className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[13px] font-extrabold text-slate-400">
        <span className="whitespace-nowrap rounded-full bg-[rgba(103,232,249,.12)] px-3 py-1 text-[#67e8f9]">Câu khởi động</span>
        <span>
          {qi + 1}/{QUESTIONS.length} · chọn đáp án trước khi vào lớp
        </span>
      </div>

      <h1
        className="font-black text-white"
        style={{ fontSize: "clamp(32px,5.6vw,80px)", lineHeight: 1.05, letterSpacing: "-0.04em", textWrap: "balance" }}
      >
        {before}
        <span
          className={`inline-block min-w-[2.6em] rounded-[.18em] border-b-[.07em] px-[.22em] text-center ${blankStyle}`}
        >
          {answered ? q.answers[pick] : "?"}
        </span>
        {after}
      </h1>

      <p className="text-[15px] text-slate-400">
        {!answered
          ? "Bấm một ô bên dưới."
          : isCorrect
            ? `Chính xác! +1000 · ${q.explanation}`
            : `Chưa đúng, đáp án là “${q.answers[q.correct]}” · ${q.explanation}`}
      </p>

      <div className="grid max-w-[620px] grid-cols-2 gap-2.5">
        {q.answers.map((text, index) => {
          const isRight = answered && index === q.correct;
          const isWrongPick = answered && index === pick && index !== q.correct;
          const tone = isRight ? "bg-[#059669] text-white" : isWrongPick ? "bg-[#be123c] text-white" : TILE_COLORS[index];
          const dim = answered && !isRight && !isWrongPick ? "opacity-35" : "";
          return (
            <button
              key={text}
              type="button"
              onClick={() => choose(index)}
              disabled={answered}
              className={`flex items-center gap-3 rounded-[20px] px-3.5 py-2.5 text-left transition disabled:cursor-default ${tone} ${dim} ${isRight ? "scale-[1.03]" : ""}`}
              style={{ minHeight: "clamp(56px,7vw,72px)", boxShadow: "inset 0 -5px 0 rgba(0,0,0,.22)" }}
            >
              <span className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-white/25 font-black">
                {LETTERS[index]}
              </span>
              <span className="flex-1 font-black [overflow-wrap:anywhere]" style={{ fontSize: "clamp(16px,1.8vw,20px)" }}>
                {text}
              </span>
              {isRight ? <span aria-hidden="true">✓</span> : null}
              {isWrongPick ? <span aria-hidden="true">✕</span> : null}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-extrabold text-slate-400">
          <span className="text-[22px] font-black text-white">{score}</span> điểm khởi động
        </span>
        <button
          type="button"
          onClick={next}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-extrabold text-slate-300 transition hover:bg-white/5"
        >
          {answered ? "Câu tiếp theo" : "Bỏ qua"}
        </button>
      </div>
    </section>
  );
}
