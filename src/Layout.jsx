import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Mic, 
  FolderOpen, 
  FileText, 
  Settings,
  Stethoscope,
  Calendar
} from 'lucide-react';
import { Toaster } from "sonner";

const navItems = [
  { name: 'Dashboard', icon: Mic, label: 'Record' },
  { name: 'Calendar', icon: Calendar, label: 'Calendar' },
  { name: 'Sessions', icon: FolderOpen, label: 'Sessions' },
  { name: 'Templates', icon: FileText, label: 'Templates' },
  { name: 'Settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      
      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                  isActive 
                    ? 'text-teal-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 w-12 h-0.5 bg-teal-600 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Side Navigation for Desktop */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 flex-col items-center py-6 z-50">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-8">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeSideTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-600 rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-20 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}