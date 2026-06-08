export default function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ").trim();
}