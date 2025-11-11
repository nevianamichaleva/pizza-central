'use client';

import "aos/dist/aos.css";
import Link from "next/link";
import { useEffect } from "react";

import eventsData from "@/data/events";

const EventsSection = () => {
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
                  <p>{event.description}</p>
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
