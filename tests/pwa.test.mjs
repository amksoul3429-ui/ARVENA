import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

function createWorker({ html = "", networkFetch = async () => { throw new Error("offline"); } } = {}) {
  const listeners = new Map();
  const added = [];
  const puts = [];
  const deleted = [];
  let matched = null;
  const cache = {
    addAll: async urls => { added.push(...urls); },
    put: async (url, response) => { puts.push(url); },
  };
  const context = {
    URL,
    fetch: networkFetch,
    self: {
      location: new URL("https://example.test/ARVENA/sw.js"),
      clients: { claim: async () => {} },
      skipWaiting: () => {},
      addEventListener: (name, callback) => listeners.set(name, callback),
    },
    caches: {
      open: async () => cache,
      keys: async () => ["old-cache", "asteria-shell-v5"],
      delete: async key => { deleted.push(key); return true; },
      match: async () => matched,
    },
  };
  vm.runInNewContext(source, context);
  return {
    listeners, added, puts, deleted,
    setMatched: value => { matched = value; },
    html,
  };
}

test("service worker installation precaches the built same-origin JS and CSS entry assets", async () => {
  const html = '<script type="module" src="/ARVENA/assets/app-123.js"></script><link rel="stylesheet" href="/ARVENA/assets/app-456.css">';
  const worker = createWorker({
    networkFetch: async () => ({ ok: true, clone() { return this; }, text: async () => html }),
  });
  let installPromise;
  worker.listeners.get("install")({ waitUntil: promise => { installPromise = promise; } });
  await installPromise;
  assert.ok(worker.added.includes("/ARVENA/"));
  assert.ok(worker.added.includes("/ARVENA/index.html"));
  assert.ok(worker.added.includes("/ARVENA/manifest.webmanifest"));
  assert.ok(worker.added.includes("/ARVENA/favicon.svg"));
  assert.ok(worker.added.includes("https://example.test/ARVENA/assets/app-123.js"));
  assert.ok(worker.added.includes("https://example.test/ARVENA/assets/app-456.css"));
  assert.ok(worker.puts.includes("/ARVENA/index.html"));
});

test("service worker serves the cached application entry when navigation is offline", async () => {
  const worker = createWorker();
  worker.setMatched("cached-index");
  const navigation = {
    request: { method: "GET", mode: "navigate", url: "https://example.test/ARVENA/" },
    respondWith(promise) { this.response = promise; },
  };
  worker.listeners.get("fetch")(navigation);
  assert.equal(await navigation.response, "cached-index");
});

test("service worker activation removes old app caches and claims clients", async () => {
  const worker = createWorker();
  let activationPromise;
  worker.listeners.get("activate")({ waitUntil: promise => { activationPromise = promise; } });
  await activationPromise;
  assert.deepEqual(worker.deleted, ["old-cache"]);
});
