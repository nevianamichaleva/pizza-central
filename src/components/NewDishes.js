'use client';

import "aos/dist/aos.css";
import { useEffect } from "react";

const chefsData = [
  {
    name: "Говежди рибай стек с гъби конфи и пюре от печени картофи",
    title: "Основни ястия",
    description:
     "Насладете се на изключителния вкус на нежния говежди рибай стек, създаден да се топи в устата ви с всяка хапка. Сервиран с деликатни гъби конфи, които придават неустоим аромат и дълбочина на вкуса. Завършен с кремообразно пюре от печени картофи, което улавя съвършенството на всяка съставка и предлага невероятно балансирано изживяване. Това е ястие, което ще ви накара да се върнете отново за още!",
    img: "/images/dinner-1.jpg",
    social: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
    },
  },
  {
    name: "Говеждо бонфиле с гъби конфи и пюре от печени картофи",
    title: "Основни ястия",
    description:
      "Опитайте перфектно изпеченото говеждо бонфиле, което се разтапя в устата ви, с неповторимата си текстура и богат вкус. В комбинация с ароматни гъби конфи, които добавят земен и дълбок вкус на ястието. Всичко това е обгърнато в кремообразно пюре от печени картофи, което е толкова гладко и вкусно, че просто не можете да се наситите. Това е ястие, което съчетава класика и елегантност в едно – идеален избор за истински гурмани!",
    img: "/images/dinner-2.jpg",
    social: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
    },
  },
  {
    name: "Сьомга филе с билкова коричка от панко, бейби моркови, зелена салата и лимон",
    title: "Основни ястия",
    description:
      "Насладете се на свежия вкус на сьомга филе, обвито в хрупкава билкова коричка от панко, която придава невероятна текстура и аромат. В допълнение, сервирано с бейби моркови, които запазват своята сладост и свежест, и зелена салата, за да освежи и балансира всяка хапка. Завършено с леко лимоново докосване, което добавя финалната нотка на свежест и цитрусова изтънченост. Леко, но удовлетворяващо ястие, което ще остави впечатление!",
    img: "/images/dinner-3.jpg",
    social: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
    },
  },
];

const NewDishes = () => {
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
    <section id="chefs" className="chefs section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
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
              data-aos="fade-up"
              data-aos-delay={(index + 1) * 100}
              key={index}
            >
              <div className="team-member">
                <div className="member-img">
                  <img src={chef.img} className="img-fluid" alt={chef.name} />
                  <div className="social">
                    {chef.social.twitter && (
                      <a href={chef.social.twitter}>
                        <i className="bi bi-twitter-x"></i>
                      </a>
                    )}
                    {chef.social.facebook && (
                      <a href={chef.social.facebook}>
                        <i className="bi bi-facebook"></i>
                      </a>
                    )}
                    {chef.social.instagram && (
                      <a href={chef.social.instagram}>
                        <i className="bi bi-instagram"></i>
                      </a>
                    )}
                    {chef.social.linkedin && (
                      <a href={chef.social.linkedin}>
                        <i className="bi bi-linkedin"></i>
                      </a>
                    )}
                  </div>
                </div>
                <div className="member-info">
                  <h4>{chef.name}</h4>
                  <span>{chef.title}</span>
                  <p>{chef.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewDishes;
