"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeName = "dark" | "light";

export const THEME_STORAGE_KEY = "coquin-theme";

function isTheme(value: string | null): value is ThemeName {
  return value === "dark" || value === "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) setThemeState(stored);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
  }, []);

  return { theme, setTheme };
}
