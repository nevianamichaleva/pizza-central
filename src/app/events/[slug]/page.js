import { get, ref } from 'firebase/database';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rtdb } from '../../../../lib/firebase';
import styles from "./page.module.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pizza-central.bg';

// Fetch event from Firebase
async function getEvent(slug) {
  try {
    const eventsRef = ref(rtdb, "events");
    const snapshot = await get(eventsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const foundEvent = Object.entries(data).find(([key, value]) => value.slug === slug);
      
      if (foundEvent) {
        const [eventId, eventData] = foundEvent;
        
        // Only show active events (or events without status field for backward compatibility)
        if (eventData.status !== undefined && eventData.status !== 'active') {
          return null;
        }
        
        return { 
          id: eventId, 
          ...eventData
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    return {
      title: 'Събитие не намерено | Ресторант-пицария Централ Добрич',
    };
  }

  const event = await getEvent(slug);

  if (!event) {
    return {
      title: 'Събитие не намерено | Ресторант-пицария Централ Добрич',
    };
  }

  const title = `${event.title} | Ресторант-пицария Централ Добрич`;
  const description = event.description || `${event.title} - Събитие в Ресторант-пицария Централ в Добрич.`;
  const url = `${baseUrl}/events/${slug}`;
  const imageUrl = event.image || `${baseUrl}/images/pizza-central-delivery.png`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: event.title,
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
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
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
export default async function EventDetailsPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  // Generate Schema.org structured data for Event
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description || event.title,
    "image": event.image 
      ? (event.image.startsWith('http') ? event.image : `${baseUrl}${event.image.startsWith('/') ? '' : '/'}${event.image}`)
      : `${baseUrl}/images/pizza-central-delivery.png`,
    "location": {
      "@type": "Place",
      "name": "Ресторант-пицария Централ",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Добрич",
        "addressCountry": "BG"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "Ресторант-пицария Централ",
      "url": baseUrl
    },
    "url": `${baseUrl}/events/${slug}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <section className="section">
        <div className="container">
          <Link className={styles.backLink} href="/events">
            &larr; Назад към събитията
          </Link>
        <div className={styles.hero}>
          <div className={styles.imageWrapper}>
            <Image
              src={event.image}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className={styles.heroImage}
              priority
            />
          </div>
          <div className={styles.heroContent}>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
