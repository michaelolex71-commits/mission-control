'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Search, 
  Calendar, 
  Clock, 
  FileText,
  ChevronDown,
  ChevronRight,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
    badge: 116, // Active tasks count
  },
  {
    id: 'memory',
    label: 'Memory',
    href: '/memory',
    icon: Search,
    badge: 56, // Memory entries count
  },
  {
    id: 'calendar',
    label: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    id: 'cron',
    label: 'Cron Jobs',
    href: '/cron',
    icon: Clock,
    badge: 44, // Total jobs count
  },
  {
    id: 'docs',
    label: 'Documentation',
    href: '/docs',
    icon: FileText,
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isCollapsed = false, isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };
  
  const hasChildren = (item: NavItem) => !!(item.children && item.children.length > 0);
  const isExpanded = (itemId: string) => expandedItems.includes(itemId);

  return (
    <aside className={`
      ${isMobile ? 'fixed' : 'fixed'}
      ${isCollapsed && isMobile ? '-translate-x-full' : 'translate-x-0'}
      left-0 top-0 z-40 h-screen w-64 border-r border-gray-800 bg-gray-900
      transition-transform duration-300
    `}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
        <h1 className="text-xl font-bold text-white">Mission Control</h1>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <NavLink
                item={item}
                isActive={isActive(item.href)}
                isExpanded={isExpanded(item.id)}
                hasChildren={hasChildren(item)}
                onToggle={() => toggleExpand(item.id)}
                onNavigate={isMobile ? onClose : undefined}
              />
              
              {/* Render children if expanded */}
              {hasChildren(item) && isExpanded(item.id) && (
                <ul className="ml-8 mt-1 space-y-1">
                  {item.children!.map((child) => (
                    <li key={child.id}>
                      <NavLink
                        item={child}
                        isActive={isActive(child.href)}
                        isExpanded={false}
                        hasChildren={false}
                        isChild
                        onNavigate={isMobile ? onClose : undefined}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <Link
            href="/settings"
            onClick={isMobile ? onClose : undefined}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <Link
            href="/help"
            onClick={isMobile ? onClose : undefined}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  isChild?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

function NavLink({ item, isActive, isExpanded, hasChildren, isChild, onToggle, onNavigate }: NavLinkProps) {
  const Icon = item.icon;
  
  const baseClasses = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors';
  const activeClasses = isActive 
    ? 'bg-blue-600 text-white' 
    : 'text-gray-300 hover:bg-gray-800 hover:text-white';
  const childClasses = isChild ? 'py-1.5 text-xs' : '';
  
  if (hasChildren) {
    return (
      <button
        onClick={onToggle}
        className={`${baseClasses} ${activeClasses} ${childClasses} w-full justify-between`}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
          {item.badge !== undefined && (
            <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
              {item.badge}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    );
  }
  
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`${baseClasses} ${activeClasses} ${childClasses}`}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
      {item.badge !== undefined && (
        <span className="ml-auto rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
