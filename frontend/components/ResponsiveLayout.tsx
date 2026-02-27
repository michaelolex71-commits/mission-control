'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/lib/use-responsive';
import { Sidebar } from '@/components/Sidebar';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // Close sidebar on mobile by default
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 h-16 flex items-center px-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-xl font-bold text-white ml-4">Mission Control</h1>
        </header>
      )}
      
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isMobile && !isSidebarOpen}
        isMobile={isMobile}
        onClose={closeSidebar}
      />
      
      {/* Main Content */}
      <main className={`
        ${isMobile ? 'pt-16' : 'pl-64'}
        min-h-screen
        transition-all duration-300
      `}>
        <div className="p-6">
          {children}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}
