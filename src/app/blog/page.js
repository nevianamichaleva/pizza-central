'use client';

import "aos/dist/aos.css";
import { get, ref } from 'firebase/database';
import moment from 'moment';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { rtdb } from '../../../lib/firebase';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAOS = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const { default: AOS } = await import("aos");
      AOS.init();
    };

    initAOS();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = ref(rtdb, "blog_posts");
        const snapshot = await get(postsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const array = Object.entries(data)
            .map(([key, value]) => ({
              id: key,
              ...value,
            }))
            .filter(post => post.status === 'published') // Only show published posts
            .sort((a, b) => {
              // Sort by published_at date (newest first)
              if (a.published_at && b.published_at) {
                return moment(b.published_at).unix() - moment(a.published_at).unix();
              }
              // If no published_at, sort by id (newest first)
              return b.id.localeCompare(a.id);
            });
          setPosts(array);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Зареждане...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="blog section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Блог</h2>
        <p>
          <span>Нашите</span> <span className="description-title">статии и новини</span>
        </p>
      </div>

      <div className="container">
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Все още няма публикувани статии.</p>
          </div>
        ) : (
          <div className="row gy-4">
            {posts.map((post, index) => (
              <div
                className="col-lg-4 col-md-6 d-flex align-items-stretch"
                data-aos="fade-up"
                data-aos-delay={(index % 3) * 100}
                key={post.id}
              >
                <Link 
                  href={`/blog/${post.slug}`} 
                  className="team-member" 
                  style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                >
                  <div className="member-img" style={{ position: 'relative', width: '100%', height: '250px', overflow: 'hidden', borderRadius: '8px' }}>
                    <Image
                      src={post.image || "/images/no-image.png"}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="member-info" style={{ padding: '20px 0' }}>
                    <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: '600' }}>{post.title}</h4>
                    {post.published_at && (
                      <span style={{ display: 'block', marginBottom: '10px', color: '#999', fontSize: '14px' }}>
                        {moment(post.published_at).format('DD.MM.YYYY')}
                      </span>
                    )}
                    <p style={{ 
                      marginTop: '10px', 
                      lineHeight: '1.6',
                      color: '#666',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : '')}
                    </p>
                    <div style={{ marginTop: '15px', color: '#c41d7f', fontWeight: '500' }}>
                      Прочети повече →
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPage;

