import { blogExcerpt, blogViewsLabel, formatPublishedDate, getPublishedBlogPosts } from '@/lib/publishedBlogPosts';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export const revalidate = 300;

const BlogPage = async () => {
  const posts = await getPublishedBlogPosts();

  return (
    <section id="blog" className="blog section">
      <div className="container section-title">
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
            {posts.map((post) => (
              <div
                className="col-lg-4 col-md-6 d-flex align-items-stretch"
                key={post.id}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="team-member"
                  style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                >
                  <div className={`member-img ${styles.blogPostCardImage}`}>
                    <Image
                      src={post.image || '/images/no-image.png'}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="member-info" style={{ padding: '20px 0' }}>
                    <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: '600' }}>{post.title}</h4>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', color: '#666', fontSize: '14px', flexWrap: 'wrap' }}>
                      {post.published_at && (
                        <span>
                          {formatPublishedDate(post.published_at)}
                        </span>
                      )}
                      {blogViewsLabel(post.views) && (
                        <span>
                          👁️ {blogViewsLabel(post.views)}
                        </span>
                      )}
                    </div>
                    <p style={{
                      marginTop: '10px',
                      lineHeight: '1.6',
                      color: '#666',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    >
                      {blogExcerpt(post)}
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
