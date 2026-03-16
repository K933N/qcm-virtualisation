export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function roundScore(value) {
  return Math.round(value * 100) / 100;
}

export function formatPoints(value) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, "");
}

export function slugify(value) {
  return normalizeForSearch(value).replace(/\s+/g, "-").replace(/(^-|-$)/g, "");
}

export function randomId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function normalizeWhitespace(value) {
  return `${value || ""}`.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
}

export function normalizeForSearch(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeQuestionKey(question) {
  const prompt = normalizeForSearch(question.prompt);
  const options = [...(question.options || [])]
    .map((option) => normalizeForSearch(option))
    .sort((left, right) => left.localeCompare(right));
  return [prompt, ...options].join("|");
}

export function pickBestExplanation(currentValue, nextValue) {
  const currentText = normalizeWhitespace(currentValue);
  const nextText = normalizeWhitespace(nextValue);
  if (!currentText) {
    return nextText || null;
  }
  if (!nextText) {
    return currentText;
  }
  return nextText.length > currentText.length ? nextText : currentText;
}

export function sortByName(items) {
  return [...items].sort((left, right) => left.name.localeCompare(right.name, "fr", { sensitivity: "base" }));
}

export function compareText(left, right) {
  return left.localeCompare(right, "fr", { sensitivity: "base" });
}
