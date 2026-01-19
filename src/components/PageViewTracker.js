'use client';

import { get, ref, remove, runTransaction } from 'firebase/database';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { rtdb } from '../../lib/firebase';

const PageViewTracker = () => {
  const hasIncremented = useRef(false);
  const pathname = usePathname();

  // Cleanup function to remove data older than 7 days
  const cleanupOldData = async () => {
    try {
      // Use localStorage to track last cleanup time to avoid running too frequently
      const lastCleanupKey = 'page_views_last_cleanup';
      const lastCleanup = localStorage.getItem(lastCleanupKey);
      const now = Date.now();
      
      // Only run cleanup once per hour maximum
      if (lastCleanup && (now - parseInt(lastCleanup)) < 3600000) {
        return;
      }

      const pageViewsRef = ref(rtdb, 'page_views');
      const snapshot = await get(pageViewsRef);
      
      if (!snapshot.exists()) {
        localStorage.setItem(lastCleanupKey, now.toString());
        return;
      }

      const data = snapshot.val();
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const datesToDelete = [];
      
      // Check each date
      Object.keys(data).forEach(dateStr => {
        try {
          const date = new Date(dateStr + 'T00:00:00'); // Add time to avoid timezone issues
          if (date < sevenDaysAgo) {
            datesToDelete.push(dateStr);
          }
        } catch (e) {
          // Skip invalid dates
        }
      });

      // Delete old dates
      if (datesToDelete.length > 0) {
        for (const dateToDelete of datesToDelete) {
          const oldDateRef = ref(rtdb, `page_views/${dateToDelete}`);
          await remove(oldDateRef);
        }
      }
      
      // Update last cleanup time
      localStorage.setItem(lastCleanupKey, now.toString());
    } catch (error) {
      console.error("Error cleaning up old page view data:", error);
    }
  };

  useEffect(() => {
    // Skip tracking for admin pages and API routes
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return;
    }

    if (hasIncremented.current) return;

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

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
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
      // Clean up old data (older than 7 days) - run this occasionally
      cleanupOldData();
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
