'use client';

import { get, ref } from 'firebase/database';
import Link from "next/link";
import { useEffect, useState } from "react";
import { rtdb } from '../../lib/firebase';

const NewDishes = () => {
  const [chefsData, setChefsData] = useState([]);

  useEffect(() => {
  }, []);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const dishesRef = ref(rtdb, "new-dishes");
        const snapshot = await get(dishesRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const array = Object.entries(data)
            .map(([key, value]) => ({
              id: key,
              ...value,
            }))
            .filter((d) => d.status == 'active')
            .sort((a, b) => {
              // Sort by creation order (newest first) - using Firebase key
              return b.id.localeCompare(a.id);
            });
          setChefsData(array);
        } else {
          setChefsData([]);
        }
      } catch (error) {
        console.error("Error fetching dishes:", error);
        setChefsData([]);
      }
    };

    fetchDishes();
  }, []);

  return (
    <section id="chefs" className="chefs section">
      {/* Section Title */}
      <div className="container section-title">
        <h2>Вкусни нови ястия в менюто ни</h2>
        <p>
          <span>Нашите</span> <span className="description-title">най-нови предложения</span>
        </p>
      </div>

      <div className="container">
        <div className="row gy-4">
          {chefsData.map((chef, index) => (
            <div
              className="col-lg-4 d-flex align-items-stretch"
             
             
              key={index}
            >
              <Link href={`/new-dishes/${chef.slug}`} className="team-member" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="member-img">
                  <img src={chef.img} className="img-fluid" alt={chef.name} />
                  <div className="social">
                    {chef.social.twitter && (
                      <a href={chef.social.twitter} aria-label={`Последвайте ${chef.name} в Twitter`} target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-twitter-x"></i>
                      </a>
                    )}
                    {chef.social.facebook && (
                      <a href={chef.social.facebook} aria-label={`Последвайте ${chef.name} в Facebook`} target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-facebook"></i>
                      </a>
                    )}
                    {chef.social.instagram && (
                      <a href={chef.social.instagram} aria-label={`Последвайте ${chef.name} в Instagram`} target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-instagram"></i>
                      </a>
                    )}
                    {chef.social.linkedin && (
                      <a href={chef.social.linkedin} aria-label={`Последвайте ${chef.name} в LinkedIn`} target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-linkedin"></i>
                      </a>
                    )}
                  </div>
                </div>
                <div className="member-info">
                  <h4>{chef.name}</h4>
                  <span>{chef.title}</span>
                  <p>
                    {chef.description && chef.description.length > 100
                      ? `${chef.description.substring(0, 100)}...`
                      : chef.description}
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

export default NewDishes;
