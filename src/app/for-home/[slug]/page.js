import MenuSection from '@/components/MenuSection';
import { get, ref } from 'firebase/database';
import { notFound } from 'next/navigation';
import { rtdb } from '../../../../lib/firebase';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

// Fetch category by slug
async function getCategoryBySlug(slug) {
  try {
    const categoriesRef = ref(rtdb, 'category');
    const snapshot = await get(categoriesRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const category = Object.entries(data)
        .map(([key, value]) => ({
          id: key,
          ...value,
        }))
        .find(cat => cat.slug === slug && (cat.forDelivery === true || (cat.forDelivery === undefined && cat.forRestaurant === undefined)));

      return category || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}


// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    return {
      title: 'Категория не намерена | Ресторант-пицария Централ Добрич',
    };
  }

  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Категория не намерена | Ресторант-пицария Централ Добрич',
    };
  }

  const categoryName = category.name.charAt(0).toUpperCase() + category.name.slice(1);
  
  // Use custom SEO fields if available, otherwise generate defaults
  const seoTitle = category.seoTitle || `${categoryName} | Ресторант-пицария Централ Добрич`;
  const seoDescription = category.seoDescription || `Разгледайте нашите ${categoryName.toLowerCase()} за доставка. Вкусна храна от Ресторант-пицария Централ в Добрич. Поръчайте онлайн!`;
  const url = `${baseUrl}/for-home/${slug}`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url,
      siteName: 'Ресторант-пицария Централ Добрич',
      locale: 'bg_BG',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/pizza-central-delivery.png`,
          width: 1200,
          height: 630,
          alt: categoryName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [`${baseUrl}/images/pizza-central-delivery.png`],
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

// Generate static params for better SEO (optional, can be removed if too many categories)
export async function generateStaticParams() {
  try {
    const categoriesRef = ref(rtdb, 'category');
    const snapshot = await get(categoriesRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const categories = Object.entries(data)
        .map(([key, value]) => ({
          id: key,
          ...value,
        }))
        .filter(cat => cat.slug && cat.slug.trim() !== '' && (cat.forDelivery === true || (cat.forDelivery === undefined && cat.forRestaurant === undefined)));

      return categories.map(category => ({
        slug: category.slug,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Main page component (Server Component)
export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Generate H1 title - use custom h1Title if available, otherwise generate from name
  const h1Title = category.h1Title || `Доставка на ${category.name.toLowerCase()}`;
  const seoContent = category.seoContent || null;

  return (
    <>
      {/* SEO Content Section */}
      <section className="container">
        <div className="row">
          {/* <div className="col-lg-10 offset-lg-1">
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '600', 
              marginBottom: '20px',
              color: '#333',
              textAlign: 'center'
            }}>
              {h1Title}
            </h1>
            
            {seoContent && (
              <div 
                style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.8',
                  color: '#555',
                  textAlign: 'justify',
                  marginBottom: '30px'
                }}
                dangerouslySetInnerHTML={{ __html: seoContent }}
              />
            )}
          </div> */}
          <div className="container section-title" data-aos="fade-up">
            <h2>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</h2>
            <h1>
              <span style={{ fontSize: '32px'}}>{h1Title}</span> 
              <br />
              <span className="description-title" style={{ color: '#ce1212', fontSize: '32px' }}>от Ресторант-пицария Централ</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <MenuSection categorySlug={slug} />
    </>
  );
}

