"use client";
import { createContext, useContext, useEffect, useState } from "react";
const ThemeContext = createContext();
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    let saved;
    try {
      saved = localStorage.getItem("newsTheme");
    } catch {}
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (value) => {
      setTheme(value);
      document.documentElement.classList.toggle("dark", value === "dark");
    };
    apply(
      saved === "light" || saved === "dark"
        ? saved
        : media.matches
          ? "dark"
          : "light",
    );
    const onChange = (e) => {
      let preference;
      try {
        preference = localStorage.getItem("newsTheme");
      } catch {}
      if (!preference) apply(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("newsTheme", next);
    } catch {}
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  return useContext(ThemeContext);
}
