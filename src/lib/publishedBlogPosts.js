import { get, ref } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

/** Published posts with a slug — the same set the sitemap lists. */
export async function getPublishedBlogPosts() {
  try {
    const snapshot = await get(ref(rtdb, 'blog_posts'));
    if (!snapshot.exists()) return [];

    return Object.entries(snapshot.val())
      .map(([id, value]) => ({ id, ...value }))
      .filter((post) => post.status === 'published' && post.slug)
      .sort((a, b) => {
        if (a.published_at && b.published_at) {
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        }
        return String(b.id).localeCompare(String(a.id));
      });
  } catch (error) {
    console.error('Error fetching published blog posts:', error);
    return [];
  }
}

export function formatPublishedDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Sofia',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.day}.${map.month}.${map.year}`;
}

export function blogExcerpt(post) {
  const source = post?.excerpt || post?.content || '';
  const text = String(source).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (post?.excerpt) return text;
  return text.length > 150 ? `${text.slice(0, 150)}...` : text;
}

export function blogViewsLabel(views) {
  if (views === undefined || views === null) return '';
  return `${views} ${views === 1 ? 'преглед' : 'прегледа'}`;
}
