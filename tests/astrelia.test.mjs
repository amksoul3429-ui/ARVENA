import test from "node:test";
import assert from "node:assert/strict";
import { ASTRELIA_BACKUP_FORMAT, createAstreliaBackup, normalizeAstreliaData, parseAstreliaBackup, readLegacyKnowledge } from "../.test-build/astrelia.js";

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
