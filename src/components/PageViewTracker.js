'use client';

import { trackPageView } from '@/lib/trackPageView';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const PageViewTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackPageView(pathname);
  }, [pathname]);

  return null;
};

export default PageViewTracker;
