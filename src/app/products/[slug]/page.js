import ProductAddToCart from '@/components/ProductAddToCart';
import { get, ref } from 'firebase/database';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rtdb } from '../../../../lib/firebase';
import styles from "./page.module.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pizza-central.bg';

// 14 основни алергена според ЕС регулациите
const allergens = [
  { value: 'gluten', label: 'Глутен' },
  { value: 'crustaceans', label: 'Ракообразни' },
  { value: 'eggs', label: 'Яйца' },
  { value: 'fish', label: 'Риба' },
  { value: 'peanuts', label: 'Фъстъци' },
  { value: 'soybeans', label: 'Соя' },
  { value: 'milk', label: 'Мляко' },
  { value: 'nuts', label: 'Ядки' },
  { value: 'celery', label: 'Целина' },
  { value: 'mustard', label: 'Горчица' },
  { value: 'sesame', label: 'Сусам' },
  { value: 'sulphites', label: 'Сулфити' },
  { value: 'lupin', label: 'Лупина' },
  { value: 'molluscs', label: 'Мекотели' },
];

const getAllergenLabel = (allergenValue) => {
  const allergen = allergens.find(a => a.value === allergenValue);
  return allergen ? allergen.label : allergenValue;
};

// Fetch product from Firebase
async function getProduct(slug) {
  try {
    const productsRef = ref(rtdb, "products");
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const foundProduct = Object.entries(data).find(([key, value]) => value.slug === slug);
      
      if (foundProduct) {
        const [productId, productData] = foundProduct;
        return { 
          id: productId, 
          ...productData
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    return {
      title: 'Продукт не намерен | Ресторант-пицария Централ Добрич',
    };
  }

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Продукт не намерен | Ресторант-пицария Централ Добрич',
    };
  }

  const title = `${product.name} | Ресторант-пицария Централ Добрич`;
  const description = product.description 
    ? product.description.replace(/<[^>]*>/g, '').substring(0, 160)
    : product.ingredients 
    ? product.ingredients.substring(0, 160)
    : `${product.name} - Вкусна храна от Ресторант-пицария Централ в Добрич.`;
  const url = `${baseUrl}/products/${slug}`;
  const imageUrl = product.image || `${baseUrl}/images/no-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: product.name,
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
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
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
export default async function ProductDetailsPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="section">
      <div className="container">
        <Link className={styles.backLink} href="/our-menu">
          &larr; Назад към менюто
        </Link>
        <div className={styles.hero}>
          <div className={styles.imageWrapper}>
            <Image
              src={product.image || "/images/no-image.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className={styles.heroImage}
              priority
            />
          </div>
          <div className={styles.heroContent}>
            <h1>{product.name}</h1>
            
            {product.price && (
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c41d7f', marginBottom: '15px' }}>
                {parseFloat(product.price).toFixed(2)} лв / {(parseFloat(product.price) / 1.95583).toFixed(2)} €
              </div>
            )}
            
            {product.weight && (
              <div style={{ marginBottom: '15px', fontSize: '16px' }}>
                <strong>Грамаж:</strong> {product.weight} {product.weightUnit || 'г'}
              </div>
            )}
            
            {product.ingredients && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Съставки:</strong>
                <p style={{ marginTop: '5px', lineHeight: '1.6' }}>{product.ingredients}</p>
              </div>
            )}
            
            {product.description && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Описание:</strong>
                <p style={{ marginTop: '5px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}
            
            {product.allergens && Array.isArray(product.allergens) && product.allergens.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Алергени:</strong>
                <p style={{ marginTop: '5px', lineHeight: '1.6', color: '#d32f2f' }}>
                  {product.allergens.map(allergenValue => getAllergenLabel(allergenValue)).join(', ')}
                </p>
              </div>
            )}
            
            <ProductAddToCart product={product} />
          </div>
        </div>
      </div>
    </section>
  );
}
