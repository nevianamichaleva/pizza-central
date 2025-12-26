'use client';

import { get, ref, runTransaction } from 'firebase/database';
import moment from 'moment';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';
import styles from "./page.module.css";

const BlogPostPage = ({ params }) => {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const getSlug = async () => {
      const resolvedParams = await params;
      const slugValue = resolvedParams?.slug || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '');
      setSlug(slugValue);
    };
    getSlug();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        const postsRef = ref(rtdb, "blog_posts");
        const snapshot = await get(postsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const foundPost = Object.entries(data).find(([key, value]) => value.slug === slug);
          
          if (foundPost) {
            const [postId, postData] = foundPost;

            // Only show published posts (unless in admin mode)
            if (postData.status !== 'published') {
              router.push('/blog');
              return;
            }
            
            const postWithViews = { 
              id: postId, 
              ...postData,
              views: postData.views || 0
            };
            
            setPost(postWithViews);
            
            // Update page title
            if (typeof document !== 'undefined') {
              document.title = `${postData.seo_title || postData.title} | Ресторант-пицария Централ`;
            }
            
            // Increment view count atomically
            const postRef = ref(rtdb, `blog_posts/${postId}/views`);
            runTransaction(postRef, (currentViews) => {
              return (currentViews || 0) + 1;
            }).catch((error) => {
              console.error("Error incrementing view count:", error);
            });
          } else {
            router.push('/blog');
          }
        } else {
          router.push('/blog');
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        router.push('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, router]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Зареждане...</p>
        </div>
      </section>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <section className="section">
        <div className="container">
          <Link className={styles.backLink} href="/blog">
            &larr; Назад към блога
          </Link>
          
          <article className={styles.blogPost}>
            <header className={styles.blogHeader}>
              <h1 className={styles.blogTitle}>{post.title}</h1>
              
              <div className={styles.blogMeta}>
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {moment(post.published_at).format('DD.MM.YYYY')}
                  </time>
                )}
                {post.views !== undefined && (
                  <span style={{ marginLeft: post.published_at ? '15px' : '0', color: '#666', fontSize: '14px' }}>
                    👁️ {post.views} {post.views === 1 ? 'преглед' : 'прегледа'}
                  </span>
                )}
              </div>
            </header>

            {post.image && (
              <div>
                <div className={styles.heroImageWrapper} style={{ marginBottom: '0px' }}>
                  <Image
                    src={post.image}
                    alt={post.image_caption || post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className={styles.heroImage}
                    priority
                  />
                </div>
                {post.image_caption && (
                  <div>
                    {post.image_caption}
                  </div>
                )}
              </div>
            )}

            {post.excerpt && (
              <div className={styles.blogExcerpt}>
                <p style={{ whiteSpace: 'pre-line' }}>{post.excerpt}</p>
              </div>
            )}

            <div 
              className={styles.blogContent}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </section>
  );
};

export default BlogPostPage;

