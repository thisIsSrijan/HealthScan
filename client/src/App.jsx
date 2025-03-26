import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import Sidebar from "./components/SideBar"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import Chatbot from "./pages/Chatbot"
import IngredientScanner from "./pages/IngredientScanner"
import { ThemeProvider } from "./context/ThemeContext"
import "./index.css"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  //if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const login = () => {
    // Dummy login function
    setIsAuthenticated(true)
    localStorage.setItem("token", "sample-token-value")
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("token")
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
          <div className="flex h-screen overflow-hidden">
            {isAuthenticated && <Sidebar logout={logout} />}
            <main className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth login={login} />} />
                  <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
                  <Route path="/chatbot" element={isAuthenticated ? <Chatbot /> : <Navigate to="/" />} />
                  <Route path="/scan" element={isAuthenticated ? <IngredientScanner /> : <Navigate to="/" />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App

