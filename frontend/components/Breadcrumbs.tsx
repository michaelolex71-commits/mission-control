'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

const routeLabels: Record<string, string> = {
  '': 'Home',
  'tasks': 'Tasks',
  'memory': 'Memory',
  'calendar': 'Calendar',
  'cron': 'Cron Jobs',
  'docs': 'Documentation',
  'settings': 'Settings',
  'help': 'Help',
  'agents': 'Agents',
  'search': 'Search',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  
  const breadcrumbs = generateBreadcrumbs(pathname);
  
  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
            <li>
              {crumb.isCurrent ? (
                <span className="text-white font-medium" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/', isCurrent: pathname === '/' }
  ];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isCurrent = index === segments.length - 1;
    
    // Get label from mapping or format segment
    let label = routeLabels[segment];
    if (!label) {
      // Handle dynamic routes (e.g., task IDs like T001)
      if (segment.match(/^T\d+$/)) {
        label = segment;
      } else {
        // Format segment as title case
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrent
    });
  });
  
  return breadcrumbs;
}

// Example breadcrumb structures:
// / → Home
// /tasks → Home > Tasks
// /tasks/T001 → Home > Tasks > T001
// /memory/search → Home > Memory > Search
// /agents/olex → Home > Agents > olex
// /cron/jobs/abc123 → Home > Cron Jobs > jobs > abc123
