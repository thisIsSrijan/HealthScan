import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  MessageSquare,
  Upload,
  BarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";

const Sidebar = ({ logout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  const navLinks = [
    { path: "/dashboard", name: "Dashboard", icon: <BarChart2 size={20} /> },
    {
      path: "/chatbot",
      name: "Health Assistant",
      icon: <MessageSquare size={20} />,
    },
    { path: "/scan", name: "Ingredient Scanner", icon: <Upload size={20} /> },
  ];

  // Mobile hamburger menu
  const MobileMenuButton = () => (
    <button
      onClick={toggleMobileSidebar}
      className="fixed z-50 p-2 text-gray-700 bg-white rounded-lg shadow-md top-4 left-4 dark:bg-gray-800 dark:text-gray-300 md:hidden"
    >
      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  const DesktopSidebar = () => (
    <motion.div
      className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}
      // animate={{ width: collapsed ? 64 : 256 }}
      animate={{
        width: collapsed ? (isMobile ? 0 : 64) : 256,
        opacity: collapsed && isMobile ? 0 : 1,
      }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        {!collapsed && (
          // <h2 className="text-xl font-bold text-gradient">HealthScan</h2>
          <motion.h2
            className="text-xl font-bold text-gradient"
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            exit={{ width: 0 }}
            // animate={{ opacity: 1, x: 0 }}
            // exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.8 }}
          >
            HealthScan
          </motion.h2>
        )}

        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-500 transition-colors rounded-lg hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex flex-col flex-1 p-2 space-y-1 overflow-y-auto">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${
              location.pathname === link.path ? "sidebar-link-active" : ""
            }`}
          >
            <span className="mr-3 text-gray-500 dark:text-gray-400">
              {link.icon}
            </span>
            {!collapsed && <span>{link.name}</span>}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <button
          onClick={toggleDarkMode}
          className="flex items-center justify-center gap-3 px-2 py-3 mb-2 text-gray-700 transition-colors rounded-3xl dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900 hover:text-emerald-700 dark:hover:text-emerald-400"
        >
          {collapsed ? (
            darkMode ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )
          ) : (
            <>
              {darkMode ? (
                <Sun size={20} className="" />
              ) : (
                <Moon size={20} className="" />
              )}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </>
          )}
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-2 py-3 text-red-600 transition-colors rounded-3xl dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300"
        >
          <LogOut size={20} className="" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.div>
  )

  const MobileSidebar = () => (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black md:hidden"
            onClick={toggleMobileSidebar}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-xl dark:bg-gray-800 md:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gradient">HealthScan</h2>
              <button
                onClick={toggleMobileSidebar}
                className="p-2 text-gray-500 transition-colors rounded-lg hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col flex-1 p-2 space-y-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`sidebar-link ${location.pathname === link.path ? "sidebar-link-active" : ""}`}
                  onClick={toggleMobileSidebar}
                >
                  <span className="mr-3 text-gray-500 dark:text-gray-400">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            <div className="p-4 border-t dark:border-gray-700">
              <button onClick={toggleDarkMode} className="mb-2 sidebar-link">
                {darkMode ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
                <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
              </button>

              <button
                onClick={logout}
                className="text-red-600 sidebar-link dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300"
              >
                <LogOut size={20} className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <MobileMenuButton />
      <DesktopSidebar />
      <MobileSidebar />
    </>
  )
};

export default Sidebar;
