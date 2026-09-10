'use client';

import { getEuropeSofiaIsoDateString } from '@/lib/launchMenuToday';
import { ref, runTransaction } from 'firebase/database';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { rtdb } from '../../lib/firebase';

const PageViewTracker = () => {
  const hasIncremented = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset the increment flag when pathname changes
    hasIncremented.current = false;
    
    // Skip tracking for admin pages and API routes
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return;
    }

    // Use sessionStorage to prevent double counting
    const storageKey = `page_view_${pathname}`;
    const hasViewed = sessionStorage.getItem(storageKey);
    
    if (hasViewed) {
      hasIncremented.current = true;
      return;
    }

    // Mark as viewed immediately to prevent double counting
    sessionStorage.setItem(storageKey, 'true');
    hasIncremented.current = true;

    const today = getEuropeSofiaIsoDateString() || new Date().toISOString().split('T')[0];
    
    // Normalize pathname: replace / with _root_ for root path, or remove leading slash
    let normalizedPath = pathname;
    if (normalizedPath === '/') {
      normalizedPath = '_root_';
    } else {
      // Remove leading slash and replace other slashes with underscores for Firebase key compatibility
      normalizedPath = normalizedPath.replace(/^\//, '').replace(/\//g, '_');
    }
    
    // Track page view: page_views/{date}/{pagePath}
    const pageViewRef = ref(rtdb, `page_views/${today}/${normalizedPath}`);
    
    console.log('Tracking page view:', { pathname, normalizedPath, today, firebasePath: `page_views/${today}/${normalizedPath}` });
    
    runTransaction(pageViewRef, (currentCount) => {
      if (currentCount === null || currentCount === undefined) {
        console.log('First visit to this page today');
        return 1;
      }
      const newCount = currentCount + 1;
      console.log('Page view incremented:', { normalizedPath, oldCount: currentCount, newCount });
      return newCount;
    }).then((result) => {
      console.log('Page view tracked successfully:', result);
    }).catch((error) => {
      console.error("Error incrementing page view count:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        pathname,
        normalizedPath,
        firebasePath: `page_views/${today}/${normalizedPath}`
      });
      // Remove from sessionStorage on error so it can retry
      sessionStorage.removeItem(storageKey);
      hasIncremented.current = false;
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default PageViewTracker;
