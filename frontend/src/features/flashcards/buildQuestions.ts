import type { Deck } from "./types.ts";

export type TestQuestion = { id: string; sentence: string; options: string[]; answer: number; explain?: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** One question per card: 4 meanings (correct + 3 distractors, same deck first). Order is shuffled. */
export function buildQuestions(deck: Deck, allDecks: Deck[]): TestQuestion[] {
  const others = allDecks.filter((d) => d.id !== deck.id).flatMap((d) => d.cards.map((c) => c.meaning));
  return shuffle(deck.cards.filter((c) => c.word.trim() && c.meaning.trim())).map((card) => {
    const same = shuffle(deck.cards.map((c) => c.meaning).filter((m) => m && m !== card.meaning));
    const extra = shuffle(others.filter((m) => m && m !== card.meaning && !same.includes(m)));
    const distractors = [...new Set([...same, ...extra])].slice(0, 3);
    const options = shuffle([card.meaning, ...distractors]);
    return {
      id: card.id,
      sentence: `“${card.word}” (${card.pos || "từ"}) nghĩa là ___`,
      options,
      answer: options.indexOf(card.meaning),
      explain: `“${card.word}” ${card.ipa} = ${card.meaning}. Ví dụ: ${card.example}`,
    };
  });
}

export const testMinutes = (n: number) => Math.max(3, Math.ceil(n / 2));
