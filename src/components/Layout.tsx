import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Code, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-100 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-neutral-950 border-r border-neutral-800 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            AlgoMaster
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-neutral-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavLink 
            to="/" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-indigo-600/10 text-indigo-400" 
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
            )}
          >
            <Home size={18} />
            Dashboard
          </NavLink>
          
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Learn
          </div>
          
          <NavLink 
            to="/curriculum" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-indigo-600/10 text-indigo-400" 
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
            )}
          >
            <BookOpen size={18} />
            Curriculum
          </NavLink>

          <NavLink 
            to="/practice" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-indigo-600/10 text-indigo-400" 
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
            )}
          >
            <Code size={18} />
            Practice Arena
          </NavLink>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">User</p>
              <p className="text-xs text-neutral-500 truncate">Student</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 lg:px-8 bg-neutral-900">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-neutral-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1" /> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
