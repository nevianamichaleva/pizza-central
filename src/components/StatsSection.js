'use client';

import 'aos/dist/aos.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const StatsSection = () => {
  const [clients, setClients] = useState(0);
  const [projects, setProjects] = useState(0);
  const [supportHours, setSupportHours] = useState(0);
  const [workers, setWorkers] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const initAOS = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      const { default: AOS } = await import('aos');
      AOS.init();
    };

    initAOS();

    // Simulate counter animation
    const animateCounters = () => {
      const duration = 1000; // animation duration in milliseconds

      const incrementCounter = (setter, targetValue) => {
        let count = 0;
        const interval = setInterval(() => {
          count += Math.ceil(targetValue / (duration / 100)); // Increment the counter gradually
          setter(count);
          if (count >= targetValue) clearInterval(interval);
        }, 100);
      };

      if (!isMounted) return;

      incrementCounter(setClients, 15);
      incrementCounter(setProjects, 35);
      incrementCounter(setSupportHours, 12500);
      incrementCounter(setWorkers, 75);
    };

    animateCounters();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="stats" className="stats section dark-background">
      {/* Background Image */}
      <div data-aos="fade-in" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
        <Image 
          src="/images/stats-bg.jpg" 
          alt="Ресторант-пицария Централ Добрич - статистика и постижения"
          fill
          style={{ objectFit: 'cover' }}
          sizes="100vw"
        />
      </div>

      <div className="container position-relative" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          {/* Stats Item 1 */}
          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span className="purecounter">{clients}</span>
              <p>Години опит</p>
            </div>
          </div>
          {/* End Stats Item */}

          {/* Stats Item 2 */}
          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span className="purecounter">{projects}</span>
              <p>Човека екип</p>
            </div>
          </div>
          {/* End Stats Item */}

          {/* Stats Item 3 */}
          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span className="purecounter">{supportHours}</span>
              <p>Обслужени клиенти</p>
            </div>
          </div>
          {/* End Stats Item */}

          {/* Stats Item 4 */}
          <div className="col-lg-3 col-md-6">
            <div className="stats-item text-center w-100 h-100">
              <span className="purecounter">{workers}</span>
              <p>Ястия</p>
            </div>
          </div>
          {/* End Stats Item */}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
