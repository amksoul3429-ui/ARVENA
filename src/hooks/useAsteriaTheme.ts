import { useEffect, useState } from "react";

export type AsteriaTheme = "dark" | "light";

/** Persists the appearance preference and keeps open ASTERIA tabs aligned. */
export function useAsteriaTheme() {
  const [theme, setTheme] = useState<AsteriaTheme>(() => {
    try {
      return (window.localStorage.getItem("asteria-theme") || window.localStorage.getItem("arvena-theme")) === "light" ? "light" : "dark";
    } catch { return "dark"; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem("asteria-theme", theme); } catch { /* Appearance preference is optional. */ }
  }, [theme]);

  useEffect(() => {
    const syncTheme = (event: StorageEvent) => {
      if (event.key !== "asteria-theme" && event.key !== "arvena-theme") return;
      if (event.newValue === "light" || event.newValue === "dark") setTheme(event.newValue);
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  return { theme, setTheme };
}
