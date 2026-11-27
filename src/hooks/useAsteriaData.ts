import { useEffect, useRef, useState } from "react";
import { loadAppData, saveAppData, subscribeToExternalChanges } from "../core/storage";
import { blank, type Data } from "../core/appData";

/** Owns local persistence, migration status, write health and cross-tab updates. */
export function useAsteriaData() {
  const [loadResult] = useState(() => loadAppData());
  // Preserve videos saved by the earlier standalone Explorer before it joined shared app storage.
  const [legacyExplorerVideos] = useState(() => {
    try {
      const raw = window.localStorage.getItem("arvena-video-library-v1");
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === "object" && typeof item.id === "string" && typeof item.title === "string" && typeof item.url === "string") : [];
    } catch { return []; }
  });
  const [data, setData] = useState<Data>(() => {
    if (!loadResult.ok || !legacyExplorerVideos.length) return loadResult.ok ? loadResult.value : blank;
    const known = new Set(loadResult.value.videos.map(video => video.id));
    const migrated = legacyExplorerVideos.filter(video => !known.has(video.id)).map(video => ({
      ...video, created: typeof video.created === "string" ? video.created : new Date().toISOString(),
    }));
    return migrated.length ? { ...loadResult.value, videos: [...loadResult.value.videos, ...migrated] } : loadResult.value;
  });
  const [persistenceReady, setPersistenceReady] = useState(loadResult.ok);
  const [hasPersistedSnapshot, setHasPersistedSnapshot] = useState(loadResult.ok && loadResult.persisted === true);
  const [storageHealthy, setStorageHealthy] = useState(loadResult.ok);
  const [persistenceError, setPersistenceError] = useState("");
  // A remote reset must clear this tab without immediately recreating the deleted key.
  const skipNextPersistence = useRef(false);

  useEffect(() => {
    if (!persistenceReady) return;
    if (skipNextPersistence.current) {
      skipNextPersistence.current = false;
      setStorageHealthy(true);
      setPersistenceError("");
      return;
    }
    const hasContent = Object.values(data).some(value => Array.isArray(value) ? value.length > 0 : typeof value === "number" && value > 0);
    if (!hasPersistedSnapshot && !hasContent) return;
    const result = saveAppData(data);
    if (result.ok) setHasPersistedSnapshot(true);
    setStorageHealthy(result.ok);
    setPersistenceError(result.ok ? "" : result.error);
    // Remove the old separate library only after the merged shared snapshot was saved.
    if (result.ok && legacyExplorerVideos.length) {
      try { window.localStorage.removeItem("arvena-video-library-v1"); } catch { /* Keep the legacy copy if cleanup is blocked. */ }
    }
  }, [data, persistenceReady, legacyExplorerVideos, hasPersistedSnapshot]);

  useEffect(() => subscribeToExternalChanges(next => {
    if (next === null) {
      skipNextPersistence.current = true;
      setHasPersistedSnapshot(false);
      setData({ ...blank });
      return;
    }
    setData(next);
  }), []);

  const resetPersistence = () => {
    skipNextPersistence.current = true;
    setHasPersistedSnapshot(false);
  };

  return {
    data,
    resetPersistence,
    setData,
    persistenceReady,
    setPersistenceReady,
    storageHealthy,
    persistenceError,
    loadError: loadResult.ok ? "" : loadResult.error,
    loadWarning: loadResult.ok ? (loadResult.warning || "") : "",
  };
}
