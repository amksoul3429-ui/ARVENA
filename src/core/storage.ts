/**
 * ARVENA local data safety layer.
 * Keeps the legacy storage key and accepts older backup files.
 */

export type BackupEnvelope<T> = {
  app: "ARVENA";
  formatVersion: 2;
  exportedAt: string;
  data: T;
  knowledgeMarketplace: unknown;
};

const COLLECTIONS = ["missions", "tasks", "goals", "knowledge", "rewards", "journal", "activity"] as const;

function safeCount(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

export function normalizeAppData<T extends object>(value: unknown, fallback: T): T {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const normalized: Record<string, unknown> = { ...(fallback as Record<string, unknown>), ...source };

  for (const key of COLLECTIONS) {
    normalized[key] = Array.isArray(source[key]) ? source[key] : (fallback as Record<string, unknown>)[key];
  }

  normalized.xp = safeCount(source.xp);
  normalized.credits = safeCount(source.credits);
  return normalized as T;
}

export function readLocalData<T extends Record<string, unknown>>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? normalizeAppData(JSON.parse(raw), fallback) : fallback;
  } catch {
    return fallback;
  }
}

export function createBackup<T>(data: T, knowledgeMarketplace: unknown): BackupEnvelope<T> {
  return {
    app: "ARVENA",
    formatVersion: 2,
    exportedAt: new Date().toISOString(),
    data,
    knowledgeMarketplace,
  };
}

export function parseBackup<T extends Record<string, unknown>>(raw: string, fallback: T): {
  data: T;
  knowledgeMarketplace?: unknown;
} {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Backup must contain a JSON object.");
  }

  const envelope = parsed as Record<string, unknown>;
  const source = envelope.data && typeof envelope.data === "object" && !Array.isArray(envelope.data)
    ? envelope.data
    : envelope;

  if (!Array.isArray((source as Record<string, unknown>).missions) ||
      !Array.isArray((source as Record<string, unknown>).tasks)) {
    throw new Error("This file is not a valid ARVENA backup.");
  }

  const data = normalizeAppData(source, fallback);
  const marketplace = envelope.knowledgeMarketplace;
  if (marketplace !== undefined &&
      (!marketplace || typeof marketplace !== "object" || Array.isArray(marketplace))) {
    throw new Error("The learning progress section is invalid.");
  }

  return {
    data,
    ...(marketplace !== undefined ? { knowledgeMarketplace: marketplace } : {}),
  };
}
