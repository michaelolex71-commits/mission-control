// Responsive Design Utilities
// Mobile-first responsive layouts for Mission Control

import { useState, useEffect } from 'react';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const breakpoints: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const query = `(min-width: ${breakpoints[breakpoint]}px)`;
    const media = window.matchMedia(query);
    
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [breakpoint]);
  
  return matches;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}

// Mobile detection hook
export function useIsMobile(): boolean {
  return !useBreakpoint('md'); // < 768px
}

// Tablet detection hook
export function useIsTablet(): boolean {
  const isMd = useBreakpoint('md');
  const isLg = useBreakpoint('lg');
  return isMd && !isLg; // 768px - 1023px
}

// Desktop detection hook
export function useIsDesktop(): boolean {
  return useBreakpoint('lg'); // >= 1024px
}

// Responsive value hook
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const is2xl = useBreakpoint('2xl');
  const isXl = useBreakpoint('xl');
  const isLg = useBreakpoint('lg');
  const isMd = useBreakpoint('md');
  const isSm = useBreakpoint('sm');
  
  if (is2xl && values['2xl']) return values['2xl'];
  if (isXl && values.xl) return values.xl;
  if (isLg && values.lg) return values.lg;
  if (isMd && values.md) return values.md;
  if (isSm && values.sm) return values.sm;
  
  return undefined;
}

// Container query hook for components
export function useContainerWidth(containerRef: React.RefObject<HTMLElement>): number {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });
    
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [containerRef]);
  
  return width;
}
