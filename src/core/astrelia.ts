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
export type AstreliaFlashcard = { id: string; question: string; answer: string; createdAt: string };
export type AstreliaPracticeItem = { id: string; text: string; done: boolean; createdAt: string };
export type AstreliaData = {
  courses: Record<string, unknown>[];
  videos: Record<string, unknown>[];
  bookmarks: AstreliaReference[];
  history: string[];
  notes: Record<string, string>;
  flashcards: AstreliaFlashcard[];
  practice: AstreliaPracticeItem[];
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
  const flashcards = Array.isArray(source.flashcards) ? source.flashcards.filter(isObject).map((item,index)=>({
    id: cleanString(item.id,180) || "flashcard-"+index,
    question: cleanString(item.question,3000),
    answer: cleanString(item.answer,10000),
    createdAt: cleanString(item.createdAt,80) || now,
  })).filter(item=>!!item.question&&!!item.answer).slice(0,5000) : [];
  const practice = Array.isArray(source.practice) ? source.practice.filter(isObject).map((item,index)=>({
    id: cleanString(item.id,180) || "practice-"+index,
    text: cleanString(item.text,3000),
    done: item.done === true,
    createdAt: cleanString(item.createdAt,80) || now,
  })).filter(item=>!!item.text).slice(0,5000) : [];
  return {
    courses: cleanRecords(source.courses),
    videos: cleanRecords(source.videos),
    bookmarks,
    history,
    notes,
    flashcards,
    practice,
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

/** Converts the first prototype's saved learning spaces into readable course records without deleting the source key. */
export function readPrototypeWorkspaces(value: unknown, now = new Date().toISOString()): {
  courses: Record<string, unknown>[];
  flashcards: AstreliaFlashcard[];
  practice: AstreliaPracticeItem[];
} {
  if (!Array.isArray(value)) return { courses: [], flashcards: [], practice: [] };
  const courses: Record<string, unknown>[] = [];
  const flashcards: AstreliaFlashcard[] = [];
  const practice: AstreliaPracticeItem[] = [];
  value.filter(isObject).forEach((item,index) => {
    const topic = cleanString(item.topic,500);
    if (!topic) return;
    const id = cleanString(item.id,180) || "prototype-"+index;
    const completed = Array.isArray(item.completedLessons) ? item.completedLessons.filter((x):x is string=>typeof x==="string") : [];
    const notes = cleanString(item.notes,50000);
    const cardList = Array.isArray(item.cards) ? item.cards.filter(isObject) : [];
    const practiceList = Array.isArray(item.practice) ? item.practice.filter(isObject) : [];
    const migratedText = [
      "Migrated personal notes",
      notes || "No personal notes were saved for this topic.",
      "Completed learning stages",
      completed.length ? completed.join(", ") : "No stages were marked complete.",
      "Saved flashcards",
      ...cardList.map(card => "Q: "+cleanString(card.question,1000)+"\nA: "+cleanString(card.answer,3000)),
      "Practice checklist",
      ...practiceList.map(task => (task.done===true?"[x] ":"[ ] ")+cleanString(task.text,1000)),
    ].join("\n\n");
    courses.push({
      id: "migrated-"+id, title: topic+" — Migrated learning space", created: cleanString(item.createdAt,80)||now,
      subject: "Personal knowledge", level: "Migrated workspace",
      description: "Your earlier ASTRELIA learning space was preserved as a readable lesson. Original prototype data remains untouched.",
      objectives: ["Review your saved notes and previous progress","Continue learning this topic in ASTRELIA"],
      prerequisiteCourseId: "", unlockCost: 0, unlocked: true, done: false, updatedAt: cleanString(item.updatedAt,80)||now,
      lessons: [{ id:"migrated-"+id+"-lesson", title:"Your saved learning material", summary:"Notes, previous stage progress, flashcards and practice items from your earlier workspace.", content:migratedText, objectives:["Review your notes","Revisit unfinished learning stages"], estimatedMinutes:20, resources:[], done:false }],
    });
    cardList.forEach((card,cardIndex)=>{
      const question=cleanString(card.question,3000),answer=cleanString(card.answer,10000);
      if(question&&answer)flashcards.push({id:"migrated-"+id+"-card-"+cardIndex,question,answer,createdAt:now});
    });
    practiceList.forEach((task,taskIndex)=>{
      const text=cleanString(task.text,3000);
      if(text)practice.push({id:"migrated-"+id+"-practice-"+taskIndex,text,done:task.done===true,createdAt:now});
    });
  });
  return { courses, flashcards, practice };
}
