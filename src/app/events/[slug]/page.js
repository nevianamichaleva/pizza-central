'use client';

import { get, ref } from 'firebase/database';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';

import styles from "./page.module.css";

const EventDetailsPage = ({ params }) => {
  const router = useRouter();
  const [event, setEvent] = useState(null);
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

    const fetchEvent = async () => {
      try {
        const eventsRef = ref(rtdb, "events");
        const snapshot = await get(eventsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const foundEvent = Object.values(data).find((e) => e.slug === slug);
          
          if (foundEvent) {
            setEvent(foundEvent);
          } else {
            router.push('/events');
          }
        } else {
          router.push('/events');
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        router.push('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
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

  if (!event) {
    return null;
  }

  return (
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
  );
};

export default EventDetailsPage;

