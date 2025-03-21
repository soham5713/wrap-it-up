import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("root")

  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </StrictMode>,
    )
  } else {
    console.error("Root element not found")
  }
})

