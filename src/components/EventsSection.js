'use client';

import "aos/dist/aos.css";
import { get, ref } from 'firebase/database';
import Link from "next/link";
import { useEffect, useState } from "react";
import { rtdb } from '../../lib/firebase';

const EventsSection = () => {
  const [eventsData, setEventsData] = useState([]);

  useEffect(() => {
    const initAOS = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const { default: AOS } = await import("aos");
      AOS.init();
    };

    initAOS();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = ref(rtdb, "events");
        const snapshot = await get(eventsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const array = Object.entries(data)
            .map(([key, value]) => ({
              id: key,
              ...value,
            }))
            .sort((a, b) => {
              // Sort by creation order (newest first) - using Firebase key
              return b.id.localeCompare(a.id);
            });
          setEventsData(array);
        } else {
          setEventsData([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEventsData([]);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section id="events" className="chefs section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Незабравими моменти</h2>
        <p>
          <span>Нашите</span>{" "}
          <span className="description-title">специални събития</span>
        </p>
      </div>

      <div className="container">
        <div className="row gy-4">
          {eventsData.map((event, index) => (
            <div
              className="col-lg-4 d-flex align-items-stretch"
              data-aos="fade-up"
              data-aos-delay={(index + 1) * 100}
              key={`${event.title}-${index}`}
            >
              <Link href={`/events/${event.slug}`} className="team-member">
                <div className="member-img">
                  <img src={event.image} className="img-fluid" alt={event.title} />
                </div>
                <div className="member-info">
                  <h4>{event.title}</h4>
                  <p>
                    {event.description && event.description.length > 100
                      ? `${event.description.substring(0, 100)}...`
                      : event.description}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
