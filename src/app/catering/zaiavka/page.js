'use client';

import CateringForm from '@/components/CateringForm';
import { useEffect } from 'react';

export default function CateringRequestPage() {
  useEffect(() => {
  }, []);

  return (
    <section id="catering-request" className="book-a-table section">
      {/* Section Title */}
      <div className="container section-title">
        <h2>Кетъринг за вашето събитие</h2>
        <p>
          <span>Заяви</span> <span className="description-title">кетъринг</span>
        </p>
        {/* <p style={{ fontSize: '18px', color: '#666', marginTop: '15px' }}>
          Ще се свържем с вас, за да уговорим час за консултация и уточняване на детайли и цени.
        </p> */}
      </div>

      <div className="container">
        <div className="row g-0">
          {/* Catering Image */}
          <div
            className="col-lg-4 reservation-img"
            style={{ backgroundImage: 'url(/images/catering/1000032303.jpg)' }}
          ></div>

          {/* Catering Form */}
          <div className="col-lg-8 d-flex align-items-center reservation-form-bg" style={{ padding: "25px" }}>
            <CateringForm />
          </div>
        </div>
      </div>
    </section>
  );
}
