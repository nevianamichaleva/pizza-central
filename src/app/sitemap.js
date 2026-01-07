import { get, ref } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

  // Fetch blog posts from Firebase
  let blogPosts = [];
  try {
    const postsRef = ref(rtdb, "blog_posts");
    const snapshot = await get(postsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      blogPosts = Object.entries(data)
        .map(([key, value]) => ({
          id: key,
          ...value,
        }))
        .filter(post => post.status === 'published' && post.slug)
        .map(post => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.updated_at ? new Date(post.updated_at) : (post.published_at ? new Date(post.published_at) : new Date()),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  // Fetch new dishes from Firebase
  let newDishes = [];
  try {
    const dishesRef = ref(rtdb, "new-dishes");
    const snapshot = await get(dishesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      newDishes = Object.entries(data)
        .map(([key, value]) => ({
          id: key,
          ...value,
        }))
        .filter(dish => dish.slug)
        .map(dish => ({
          url: `${baseUrl}/new-dishes/${dish.slug}`,
          lastModified: dish.updated_at ? new Date(dish.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
    }
  } catch (error) {
    console.error('Error fetching new dishes for sitemap:', error);
  }

  // Fetch events from Firebase
  let events = [];
  try {
    const eventsRef = ref(rtdb, "events");
    const snapshot = await get(eventsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      events = Object.entries(data)
        .map(([key, value]) => ({
          id: key,
          ...value,
        }))
        .filter(event => event.slug)
        .map(event => ({
          url: `${baseUrl}/events/${event.slug}`,
          lastModified: event.updated_at ? new Date(event.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
    }
  } catch (error) {
    console.error('Error fetching events for sitemap:', error);
  }

  // Fetch products with slug from Firebase
  let products = [];
  try {
    const productsRef = ref(rtdb, "products");
    const snapshot = await get(productsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      products = Object.entries(data)
        .map(([key, value]) => ({
          id: key,
          ...value,
        }))
        .filter(product => {
          // Only include products with valid slug that are not side dishes
          return product.slug && 
                 product.slug.trim() !== '' && 
                 !product.isSideDish &&
                 product.status !== 'archived'; // Exclude archived products if status field exists
        })
        .map(product => ({
          url: `${baseUrl}/products/${product.slug}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Fetch categories with slug from Firebase for for-home routes
  let categories = [];
  try {
    const categoriesRef = ref(rtdb, "category");
    const snapshot = await get(categoriesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      categories = Object.entries(data)
        .map(([key, value]) => ({
          id: key,
          ...value,
        }))
        .filter(category => {
          // Only include categories with valid slug that are for delivery
          return category.slug && 
                 category.slug.trim() !== '' && 
                 (category.forDelivery === true || (category.forDelivery === undefined && category.forRestaurant === undefined)) &&
                 category.status !== 'archived'; // Exclude archived categories if status field exists
        })
        .map(category => ({
          url: `${baseUrl}/for-home/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/our-menu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/for-home`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/new-dishes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/launch-menu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/detski-kut`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/reservation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/bg/central-menu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/central-menu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ro/central-menu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/de/central-menu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogPosts,
    ...newDishes,
    ...events,
    ...products,
    ...categories,
  ];
}
























