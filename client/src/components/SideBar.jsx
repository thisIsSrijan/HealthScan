import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MessageSquare, Upload, BarChart2, LogOut, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ logout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navLinks = [
    { path: '/dashboard', name: 'Dashboard', icon: <BarChart2 size={20} /> },
    { path: '/chatbot', name: 'Health Assistant', icon: <MessageSquare size={20} /> },
    { path: '/scan', name: 'Ingredient Scanner', icon: <Upload size={20} /> },
    { path: '/temporary', name: 'Text Extraction Demo'},
  ];

  return (
    <motion.div 
      className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        {!collapsed && (
          <h2 className="text-xl font-bold text-gradient">HealthScan</h2>
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
              location.pathname === link.path ? 'sidebar-link-active' : ''
            }`}
          >
            <span className="mr-3 text-gray-500 dark:text-gray-400">{link.icon}</span>
            {!collapsed && <span>{link.name}</span>}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <button 
          onClick={toggleDarkMode}
          className="justify-center mb-2 sidebar-link"
        >
          {collapsed ? (
            darkMode ? <Sun size={20} /> : <Moon size={20} />
          ) : (
            <>
              {darkMode ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </>
          )}
        </button>
        
        <button 
          onClick={logout}
          className="text-red-600 sidebar-link dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300"
        >
          <LogOut size={20} className="mr-3" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
