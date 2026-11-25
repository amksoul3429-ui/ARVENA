export const ASTRELIA_STORAGE_KEY = "astrelia-release1-v1";
export const ASTRELIA_BACKUP_FORMAT = "astrelia-knowledge-backup";
export const ASTRELIA_BACKUP_VERSION = 1;

export type AstreliaReference = {
  id: string;
  title: string;
  url: string;
  kind: "article" | "book" | "paper" | "video" | "other";
  source: string;
  description: string;
  savedAt: string;
};
export type AstreliaData = {
  courses: Record<string, unknown>[];
  videos: Record<string, unknown>[];
  bookmarks: AstreliaReference[];
  history: string[];
  notes: Record<string, string>;
  updatedAt: string;
};
export type AstreliaBackup = {
  format: typeof ASTRELIA_BACKUP_FORMAT;
  version: typeof ASTRELIA_BACKUP_VERSION;
  app: "ASTRELIA";
  exportedAt: string;
  data: AstreliaData;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const cleanString = (value: unknown, max = 20000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const cleanRecords = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter(isObject).filter(item => typeof item.id === "string" && typeof item.title === "string").slice(0, 5000)
    : [];

export function normalizeAstreliaData(value: unknown, now = new Date().toISOString()): AstreliaData {
  const source = isObject(value) ? value : {};
  const bookmarks = Array.isArray(source.bookmarks)
    ? source.bookmarks.filter(isObject).map((item, index) => ({
        id: cleanString(item.id, 180) || "bookmark-" + index,
        title: cleanString(item.title, 500) || "Saved resource",
        url: cleanString(item.url, 3000),
        kind: (["article", "book", "paper", "video", "other"].includes(String(item.kind)) ? item.kind : "other") as AstreliaReference["kind"],
        source: cleanString(item.source, 200),
        description: cleanString(item.description, 3000),
        savedAt: cleanString(item.savedAt, 80) || now,
      })).filter(item => /^https:\/\//i.test(item.url)).slice(0, 5000)
    : [];
  const notesSource = isObject(source.notes) ? source.notes : {};
  const notes = Object.fromEntries(Object.entries(notesSource).slice(0, 2000).map(([key, value]) => [cleanString(key, 180), cleanString(value, 50000)]).filter(([key]) => !!key));
  const history = Array.isArray(source.history)
    ? [...new Set(source.history.filter((item): item is string => typeof item === "string").map(item => item.trim().slice(0, 300)).filter(Boolean))].slice(0, 100)
    : [];
  return {
    courses: cleanRecords(source.courses),
    videos: cleanRecords(source.videos),
    bookmarks,
    history,
    notes,
    updatedAt: cleanString(source.updatedAt, 80) || now,
  };
}

export function createAstreliaBackup(value: unknown, now = new Date().toISOString()): AstreliaBackup {
  return { format: ASTRELIA_BACKUP_FORMAT, version: ASTRELIA_BACKUP_VERSION, app: "ASTRELIA", exportedAt: now, data: normalizeAstreliaData(value, now) };
}

export function parseAstreliaBackup(value: unknown): { ok: true; data: AstreliaData } | { ok: false; error: string } {
  if (!isObject(value) || value.format !== ASTRELIA_BACKUP_FORMAT) {
    return { ok: false, error: "This file is not an ASTRELIA knowledge backup." };
  }
  if (value.version !== ASTRELIA_BACKUP_VERSION || !isObject(value.data)) {
    return { ok: false, error: "This ASTRELIA backup version is not supported. Your current data has not been changed." };
  }
  return { ok: true, data: normalizeAstreliaData(value.data) };
}

export function readLegacyKnowledge(value: unknown): { courses: Record<string, unknown>[]; videos: Record<string, unknown>[] } {
  if (!isObject(value)) return { courses: [], videos: [] };
  const data = value.format === "arvena-backup" && isObject(value.data) ? value.data : value;
  return {
    courses: cleanRecords(data.knowledge),
    videos: cleanRecords(data.videos),
  };
}
