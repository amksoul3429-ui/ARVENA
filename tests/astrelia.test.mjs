import test from "node:test";
import assert from "node:assert/strict";
import { ASTRELIA_BACKUP_FORMAT, createAstreliaBackup, normalizeAstreliaData, parseAstreliaBackup, readLegacyKnowledge, readPrototypeWorkspaces } from "../.test-build/astrelia.js";

test("ASTRELIA normalizes collections and removes malformed or unsafe bookmarks", () => {
  const data = normalizeAstreliaData({
    courses: [{ id: "c1", title: "Course" }, null, { title: "Missing id" }],
    videos: [{ id: "v1", title: "Video" }],
    bookmarks: [
      { id: "b1", title: "Paper", url: "https://example.org/paper", kind: "paper" },
      { id: "b2", title: "Unsafe", url: "javascript:alert(1)" },
    ],
    history: ["  vectors  ", "vectors", "", 4],
    notes: { "topic-1": "My notes" },
  }, "2026-11-25T00:00:00.000Z");
  assert.equal(data.courses.length, 1);
  assert.equal(data.videos.length, 1);
  assert.equal(data.bookmarks.length, 1);
  assert.deepEqual(data.history, ["vectors"]);
  assert.equal(data.notes["topic-1"], "My notes");
});

test("ASTRELIA backup round-trips normalized knowledge data", () => {
  const backup = createAstreliaBackup({ courses: [{ id: "c", title: "Vectors" }], history: ["vectors"] }, "2026-11-25T00:00:00.000Z");
  assert.equal(backup.format, ASTRELIA_BACKUP_FORMAT);
  const parsed = parseAstreliaBackup(backup);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.data.courses[0].title, "Vectors");
    assert.deepEqual(parsed.data.history, ["vectors"]);
  }
});

test("ASTRELIA rejects unsupported backups without attempting a restore", () => {
  const parsed = parseAstreliaBackup({ format: ASTRELIA_BACKUP_FORMAT, version: 99, data: {} });
  assert.equal(parsed.ok, false);
});

test("legacy ULS/ARVENA knowledge and videos can be read without mutating source", () => {
  const original = { format: "arvena-backup", version: 1, data: { knowledge: [{ id: "k1", title: "Chemistry" }], videos: [{ id: "v1", title: "Vectors lecture" }] } };
  const before = JSON.stringify(original);
  const result = readLegacyKnowledge(original);
  assert.equal(result.courses[0].title, "Chemistry");
  assert.equal(result.videos[0].title, "Vectors lecture");
  assert.equal(JSON.stringify(original), before);
});

test("ASTRELIA preserves flashcards and practice items through normalization and backup", () => {
  const value = normalizeAstreliaData({
    flashcards: [{ id: "f1", question: "What is a vector?", answer: "A quantity with magnitude and direction." }, { id: "bad", question: "No answer" }],
    practice: [{ id: "p1", text: "Solve five vector problems", done: true }, { id: "bad", text: "" }],
  }, "2026-11-25T00:00:00.000Z");
  assert.equal(value.flashcards.length, 1);
  assert.equal(value.practice.length, 1);
  assert.equal(value.practice[0].done, true);
  const backup = createAstreliaBackup(value);
  const restored = parseAstreliaBackup(backup);
  assert.equal(restored.ok, true);
  if (restored.ok) {
    assert.equal(restored.data.flashcards[0].question, "What is a vector?");
    assert.equal(restored.data.practice[0].text, "Solve five vector problems");
  }
});

test("earlier ASTRELIA workspaces migrate notes, cards and exercises without mutating source", () => {
  const old = [{ id: "old1", topic: "Vectors", notes: "Dot product notes", completedLessons: ["0", "1"], cards: [{ id: "c1", question: "Dot product?", answer: "Scalar product" }], practice: [{ id: "p1", text: "Solve exercises", done: true }] }];
  const before = JSON.stringify(old);
  const migrated = readPrototypeWorkspaces(old, "2026-11-25T00:00:00.000Z");
  assert.equal(migrated.courses.length, 1);
  assert.match(migrated.courses[0].title, /Vectors/);
  assert.equal(migrated.flashcards.length, 1);
  assert.equal(migrated.practice[0].done, true);
  assert.equal(JSON.stringify(old), before);
});
