'use client';

import { ref, runTransaction } from 'firebase/database';
import { useEffect, useRef } from 'react';
import { rtdb } from '../../lib/firebase';

const BlogViewCounter = ({ postId }) => {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!postId || hasIncremented.current) return;

    // Use sessionStorage to prevent double counting even if component remounts
    const storageKey = `blog_view_${postId}`;
    const hasViewed = sessionStorage.getItem(storageKey);
    
    if (hasViewed) {
      hasIncremented.current = true;
      return;
    }

    // Mark as viewed immediately to prevent double counting
    sessionStorage.setItem(storageKey, 'true');
    hasIncremented.current = true;

    // Increment view count atomically
    const postRef = ref(rtdb, `blog_posts/${postId}/views`);
    runTransaction(postRef, (currentViews) => {
      return (currentViews || 0) + 1;
    }).catch((error) => {
      console.error("Error incrementing view count:", error);
      // Remove from sessionStorage on error so it can retry
      sessionStorage.removeItem(storageKey);
      hasIncremented.current = false;
    });
  }, [postId]);

  return null; // This component doesn't render anything
};

export default BlogViewCounter;

