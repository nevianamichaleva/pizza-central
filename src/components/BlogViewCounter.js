'use client';

import { ref, runTransaction } from 'firebase/database';
import { useEffect } from 'react';
import { rtdb } from '../../lib/firebase';

const BlogViewCounter = ({ postId }) => {
  useEffect(() => {
    if (!postId) return;

    // Increment view count atomically
    const postRef = ref(rtdb, `blog_posts/${postId}/views`);
    runTransaction(postRef, (currentViews) => {
      return (currentViews || 0) + 1;
    }).catch((error) => {
      console.error("Error incrementing view count:", error);
    });
  }, [postId]);

  return null; // This component doesn't render anything
};

export default BlogViewCounter;

