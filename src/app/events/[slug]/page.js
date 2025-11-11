import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import events, { getEventBySlug } from "@/data/events";

import styles from "./page.module.css";

export function generateStaticParams() {
  return events.map((event) => ({
    slug: event.slug,
  }));
}

export function generateMetadata({ params }) {
  const event = getEventBySlug(params.slug);

  if (!event) {
    return {
      title: "Събитието не е намерено",
    };
  }

  return {
    title: event.title,
    description: event.description,
  };
}

const EventDetailsPage = ({ params }) => {
  const event = getEventBySlug(params.slug);

  if (!event) {
    notFound();
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

