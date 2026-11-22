import { useEffect, useState } from "react";

export type ThemeSetting = "system" | "light" | "dark";
const KEY = "app.theme";
const COLORS = { light: "#F5F0E8", dark: "#171513" };

export function getTheme(): ThemeSetting {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function resolved(t: ThemeSetting): "light" | "dark" {
  if (t !== "system") return t;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(t: ThemeSetting = getTheme()) {
  const root = document.documentElement;
  if (t === "system") delete root.dataset.theme;
  else root.dataset.theme = t;
  const color = COLORS[resolved(t)];
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", color));
}

export function setTheme(t: ThemeSetting) {
  try {
    if (t === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, t);
  } catch {
    /* egal */
  }
  applyTheme(t);
  window.dispatchEvent(new Event("themechange"));
}

export function useTheme(): [ThemeSetting, (t: ThemeSetting) => void] {
  const [t, setT] = useState<ThemeSetting>(getTheme);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSys = () => applyTheme();
    const onChange = () => setT(getTheme());
    mq.addEventListener("change", onSys);
    window.addEventListener("themechange", onChange);
    return () => {
      mq.removeEventListener("change", onSys);
      window.removeEventListener("themechange", onChange);
    };
  }, []);
  return [t, setTheme];
}
