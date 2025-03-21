"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem("theme")
    // Check user's system preference if no saved theme
    if (!savedTheme) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return savedTheme
  })

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem("theme", theme)

    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark")
      document.documentElement.classList.add("light")
    } else if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      document.documentElement.classList.toggle("dark", systemTheme === "dark")
      document.documentElement.classList.toggle("light", systemTheme === "light")

      // Listen for system theme changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e) => {
        document.documentElement.classList.toggle("dark", e.matches)
        document.documentElement.classList.toggle("light", !e.matches)
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

