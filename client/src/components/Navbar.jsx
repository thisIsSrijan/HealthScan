import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, User, MessageSquare, Upload, BarChart2, LogOut } from "lucide-react"

const Navbar = ({ logout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const navLinks = [
    { path: "/dashboard", name: "Dashboard", icon: <BarChart2 size={20} /> },
    { path: "/chatbot", name: "Health Assistant", icon: <MessageSquare size={20} /> },
    { path: "/scan", name: "Ingredient Scanner", icon: <Upload size={20} /> },
  ]

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "-100%",
      transition: {
        duration: 0.3,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={toggleMenu} className="text-gray-800 hover:text-teal-500 focus:outline-none p-2">
                <Menu size={24} />
              </button>
              <div className="ml-4 flex items-center">
                <span className="text-gradient font-bold text-xl">HealthScan</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                    location.pathname === link.path ? "text-teal-700 bg-teal-50" : "text-gray-700"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={logout}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="flex md:hidden">
              <Link to="/dashboard" className="p-2">
                <User className="text-gray-800 hover:text-teal-500" size={24} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-40 flex"
          >
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40"
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div className="relative flex flex-col w-72 max-w-sm bg-white h-full overflow-y-auto shadow-xl z-50">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gradient">HealthScan</h2>
                <button onClick={closeMenu} className="p-2 text-gray-600 hover:text-teal-500">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col p-2 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                      location.pathname === link.path ? "bg-teal-50 text-teal-700" : ""
                    }`}
                    onClick={closeMenu}
                  >
                    <span className="mr-3 text-gray-500">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto p-4 border-t">
                <button
                  onClick={() => {
                    closeMenu()
                    logout()
                  }}
                  className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={20} className="mr-3" />
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar

