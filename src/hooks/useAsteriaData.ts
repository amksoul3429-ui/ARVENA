import { useEffect, useState } from "react";
import { loadAppData, saveAppData, subscribeToExternalChanges } from "../core/storage";
import { blank, type Data } from "../core/appData";

/** Owns local persistence, migration status, write health and cross-tab updates. */
export function useAsteriaData() {
  const [loadResult] = useState(() => loadAppData());
  const [data, setData] = useState<Data>(() => loadResult.ok ? loadResult.value : blank);
  const [persistenceReady, setPersistenceReady] = useState(loadResult.ok);
  const [storageHealthy, setStorageHealthy] = useState(loadResult.ok);
  const [persistenceError, setPersistenceError] = useState("");

  useEffect(() => {
    if (!persistenceReady) return;
    const result = saveAppData(data);
    setStorageHealthy(result.ok);
    setPersistenceError(result.ok ? "" : result.error);
  }, [data, persistenceReady]);

  useEffect(() => subscribeToExternalChanges(next => setData(next)), []);

  useEffect(() => {
    // Optional legacy cleanup must never prevent the local-first app from starting.
    try {
      window.localStorage.removeItem("arvena-aeris-endpoint-v1");
      window.localStorage.removeItem("arvena-aeris-token-v1");
    } catch { /* Storage preferences are optional. */ }
  }, []);

  return {
    data,
    setData,
    persistenceReady,
    setPersistenceReady,
    storageHealthy,
    persistenceError,
    loadError: loadResult.ok ? "" : loadResult.error,
    loadWarning: loadResult.ok ? (loadResult.warning || "") : "",
  };
}
