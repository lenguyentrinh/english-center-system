import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import TestRunner from "@/features/test/TestRunner.tsx";
import { buildQuestions, testMinutes } from "@/features/flashcards/buildQuestions.ts";
import { recordTest, useAllDecks, useDeck } from "@/features/flashcards/store.ts";

export default function StudentFlashcardTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deck = useDeck(id);
  const all = useAllDecks();
  // Built once per visit so options do not reshuffle while the student is answering.
  const [questions] = useState(() => (deck ? buildQuestions(deck, all) : []));

  if (!deck || questions.length === 0) {
    return (
      <StudentLayout>
        <Link to="/student/flashcards" className="text-[13px] font-semibold text-slate-500 hover:text-slate-950">
          ← Bộ thẻ
        </Link>
        <p className="mt-6 text-sm text-slate-500">Không tìm thấy bộ thẻ hoặc bộ thẻ chưa có thẻ nào.</p>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <TestRunner
        title={`Kiểm tra · ${deck.title}`}
        description="Chọn nghĩa đúng cho mỗi từ."
        questions={questions}
        minutes={testMinutes(questions.length)}
        onFinish={(r) => recordTest(deck.id, { correct: r.correct, total: r.total })}
        onExit={() => navigate("/student/flashcards")}
      />
    </StudentLayout>
  );
}
