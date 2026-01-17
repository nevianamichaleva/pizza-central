import NewDishAddToCart from '@/components/NewDishAddToCart';
import { get, ref } from 'firebase/database';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rtdb } from '../../../../lib/firebase';
import styles from "./page.module.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';

// Fetch new dish from Firebase
async function getNewDish(slug) {
  try {
    const dishesRef = ref(rtdb, "new-dishes");
    const snapshot = await get(dishesRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const foundDish = Object.entries(data).find(([key, value]) => value.slug === slug);
      
      if (foundDish) {
        const [dishId, dishData] = foundDish;
        
        // Fetch product data if productId exists
        let product = null;
        if (dishData.productId) {
          const productRef = ref(rtdb, `products/${dishData.productId}`);
          const productSnapshot = await get(productRef);
          
          if (productSnapshot.exists()) {
            const productData = productSnapshot.val();
            product = {
              id: dishData.productId,
              ...productData
            };
          }
        }
        
        return { 
          id: dishId, 
          ...dishData,
          product
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching new dish:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.id;
  
  if (!slug) {
    return {
      title: 'Ястие не намерено | Ресторант-пицария Централ Добрич',
    };
  }

  const dish = await getNewDish(slug);

  if (!dish) {
    return {
      title: 'Ястие не намерено | Ресторант-пицария Централ Добрич',
    };
  }

  const title = `${dish.name} | Ресторант-пицария Централ Добрич`;
  const description = dish.description || dish.title || `${dish.name} - Ново предложение от Ресторант-пицария Централ в Добрич.`;
  const url = `${baseUrl}/new-dishes/${slug}`;
  const imageUrl = dish.img || `${baseUrl}/images/no-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: dish.name,
      description,
      url,
      siteName: 'Ресторант-пицария Централ Добрич',
      locale: 'bg_BG',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: dish.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dish.name,
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
export default async function NewDishDetailsPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.id;

  if (!slug) {
    notFound();
  }

  const dish = await getNewDish(slug);

  if (!dish) {
    notFound();
  }

  // Generate Schema.org structured data for Product
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": dish.name,
    "description": dish.description || dish.title || dish.name,
    "image": dish.img 
      ? (dish.img.startsWith('http') ? dish.img : `${baseUrl}${dish.img.startsWith('/') ? '' : '/'}${dish.img}`)
      : `${baseUrl}/images/no-image.png`,
    "offers": dish.product && dish.product.price ? {
      "@type": "Offer",
      "price": parseFloat(dish.product.price).toFixed(2),
      "priceCurrency": "BGN",
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/new-dishes/${slug}`
    } : undefined,
    "brand": {
      "@type": "Brand",
      "name": "Ресторант-пицария Централ"
    }
  };

  // Remove undefined fields
  if (!productSchema.offers) {
    delete productSchema.offers;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <section className="section">
        <div className="container">
          <Link className={styles.backLink} href="/new-dishes">
            &larr; Назад към новите предложения
          </Link>
        <div className={styles.hero}>
          <div className={styles.imageWrapper}>
            <Image
              src={dish.img || "/images/no-image.png"}
              alt={dish.name}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className={styles.heroImage}
              priority
            />
          </div>
          <div className={styles.heroContent}>
            <h1>{dish.name}</h1>
            {dish.title && (
              <span style={{ display: 'block', marginBottom: '10px', color: '#666' }}>{dish.title}</span>
            )}
            
            {dish.product && (
              <>
                {dish.product.price && (
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c41d7f', marginBottom: '15px' }}>
                    {parseFloat(dish.product.price).toFixed(2)} лв / {(parseFloat(dish.product.price) / 1.95583).toFixed(2)} €
                  </div>
                )}
                
                {dish.product.weight && (
                  <div style={{ marginBottom: '15px', fontSize: '16px' }}>
                    <strong>Грамаж:</strong> {dish.product.weight} {dish.product.weightUnit || 'г'}
                  </div>
                )}
                
                {dish.product.ingredients && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Съставки:</strong>
                    <p style={{ marginTop: '5px', lineHeight: '1.6' }}>{dish.product.ingredients}</p>
                  </div>
                )}
                
                {dish.product.description && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Описание:</strong>
                    <p style={{ marginTop: '5px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: dish.product.description }} />
                  </div>
                )}
              </>
            )}
            
            {dish.description && (
              <div style={{ marginBottom: '15px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <p style={{ marginTop: '5px', lineHeight: '1.6' }}>{dish.description}</p>
              </div>
            )}
            
            <NewDishAddToCart dish={dish} />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
