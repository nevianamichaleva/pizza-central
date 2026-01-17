import BlogViewCounter from '@/components/BlogViewCounter';
import { get, ref } from 'firebase/database';
import moment from 'moment';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rtdb } from '../../../../lib/firebase';
import styles from "./page.module.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

// Fetch blog post from Firebase
async function getBlogPost(slug) {
  try {
    const postsRef = ref(rtdb, "blog_posts");
    const snapshot = await get(postsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const foundPost = Object.entries(data).find(([key, value]) => value.slug === slug);
      
      if (foundPost) {
        const [postId, postData] = foundPost;
        
        // Only show published posts
        if (postData.status !== 'published') {
          return null;
        }
        
        return { 
          id: postId, 
          ...postData,
          views: postData.views || 0
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    return {
      title: 'Статия не намерена | Ресторант-пицария Централ Добрич',
    };
  }

  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Статия не намерена | Ресторант-пицария Централ Добрич',
    };
  }

  const title = post.seo_title || post.title;
  const description = post.meta_description || post.excerpt || (post.content 
    ? post.content.replace(/<[^>]*>/g, '').substring(0, 160)
    : `${post.title} - Статия от Ресторант-пицария Централ в Добрич.`);
  const url = post.canonical_url || `${baseUrl}/blog/${slug}`;
  const imageUrl = post.image || `${baseUrl}/images/pizza-central-delivery.png`;

  return {
    title: `${title} | Ресторант-пицария Централ Добрич`,
    description,
    keywords: post.meta_keywords ? post.meta_keywords.split(',').map(k => k.trim()) : undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: 'Ресторант-пицария Централ Добрич',
      locale: 'bg_BG',
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: ['Ресторант-пицария Централ'],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.image_caption || post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Main page component (Server Component)
export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Generate Schema.org structured data for Article/BlogPosting
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.meta_description || post.excerpt || (post.content 
      ? post.content.replace(/<[^>]*>/g, '').substring(0, 200)
      : post.title),
    "image": post.image 
      ? (post.image.startsWith('http') ? post.image : `${baseUrl}${post.image.startsWith('/') ? '' : '/'}${post.image}`)
      : `${baseUrl}/images/pizza-central-delivery.png`,
    "datePublished": post.published_at || undefined,
    "dateModified": post.updated_at || post.published_at || undefined,
    "author": {
      "@type": "Organization",
      "name": "Ресторант-пицария Централ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ресторант-пицария Централ",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${slug}`
    }
  };

  // Remove undefined fields
  if (!articleSchema.datePublished) delete articleSchema.datePublished;
  if (!articleSchema.dateModified) delete articleSchema.dateModified;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <section className="section">
        <BlogViewCounter postId={post.id} />
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
    </>
  );
}
