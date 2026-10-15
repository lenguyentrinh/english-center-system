import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "@/shared/components/layout/StudentLayout.tsx";
import { BackLink } from "@/shared/components/PageHeader.tsx";
import TestRunner from "@/features/test/TestRunner.tsx";
import { buildQuestions, testMinutes } from "@/features/flashcards/buildQuestions.ts";
import { recordTest, useAllDecks, useDeck, useStudentDecks } from "@/features/flashcards/store.ts";

export default function StudentFlashcardTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deck = useDeck(id);
  const all = useAllDecks();
  // A hidden/deleted/foreign deck is not testable.
  const visible = useStudentDecks().some((x) => x.deck.id === id);
  // Built once per visit so options do not reshuffle while the student is answering.
  const [questions] = useState(() => (deck ? buildQuestions(deck, all.filter((d) => d.source !== "STUDENT" || d.id === deck.id)) : []));

  if (!deck || !visible || questions.length === 0) {
    return (
      <StudentLayout>
        <BackLink to="/student/flashcards">Bộ thẻ</BackLink>
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
