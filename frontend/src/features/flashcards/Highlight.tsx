/** Renders `text` with the first occurrence of `word` highlighted (card example sentences). */
export default function Highlight({ text, word }: { text: string; word: string }) {
  const w = word.trim();
  if (!w || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(w.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded px-1 text-white" style={{ background: "rgba(59,130,246,.4)" }}>
        {text.slice(idx, idx + w.length)}
      </mark>
      {text.slice(idx + w.length)}
    </>
  );
}
