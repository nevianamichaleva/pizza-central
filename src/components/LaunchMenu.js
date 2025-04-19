import { Autoplay, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "../../node_modules/swiper/swiper-bundle.min.css";

const LaunchMenu = () => {
  const events = [
    {
      title: '14 април 2025',
      name: "Понеделник",
      menu: [
        {"name": "Пилешка супа", "price": "5,00 лв."},
        {"name": "Зеленчукова супа", "price": "5,00 лв."},
        {"name": "Агнешка плешка с ориз и спанак", "price": "15,00 лв."},
        {"name": "Торта Вълшебна целувка", "price": "5,80 лв."},
      ],
      description: "🌿 Агнешко изкушение по пролетному - нежна агнешка плешка, бавно изпечена до съвършенство, поднесена с ароматен ориз, пресен спанак и подправки, които събуждат апетита. Класическо българско ястие с модерен полъх, идеално за сезона!",
      image: "/images/launch/launch8.jpg",
    },
    {
      title: '15 април 2025',
      name: "Вторник",
      menu: [
        {"name": "Пилешка супа", "price": "5,00 лв."},
        {"name": "Зеленчукова супа", "price": "5,00 лв."},
        {"name": "Агнешка плешка с ориз и спанак", "price": "15,00 лв."},
        {"name": "Торта Вълшебна целувка", "price": "5,80 лв."},
      ],
      description: "🌿 Агнешко изкушение по пролетному - нежна агнешка плешка, бавно изпечена до съвършенство, поднесена с ароматен ориз, пресен спанак и подправки, които събуждат апетита. Класическо българско ястие с модерен полъх, идеално за сезона!",
      image: "/images/launch/launch1.jpg",
    },
    {
      name: "Сряда",
      menu: [
        {"name": "Пилешка супа", "price": "5,00 лв."},
        {"name": "Зеленчукова супа", "price": "5,00 лв."},
        {"name": "Агнешка плешка с ориз и спанак", "price": "15,00 лв."},
        {"name": "Торта Вълшебна целувка", "price": "5,80 лв."},
      ],
      description: "🌿 Агнешко изкушение по пролетному - нежна агнешка плешка, бавно изпечена до съвършенство, поднесена с ароматен ориз, пресен спанак и подправки, които събуждат апетита. Класическо българско ястие с модерен полъх, идеално за сезона!",
        image: "/images/launch/launch2.jpg",
    },
    {
      name: "Четвъртък",
      menu: [
        {"name": "Пилешка супа", "price": "5,00 лв."},
        {"name": "Зеленчукова супа", "price": "5,00 лв."},
        {"name": "Агнешка плешка с ориз и спанак", "price": "15,00 лв."},
        {"name": "Торта Вълшебна целувка", "price": "5,80 лв."},
      ],
      image: "/images/launch/launch6.jpg",
      description: "🌿 Агнешко изкушение по пролетному - нежна агнешка плешка, бавно изпечена до съвършенство, поднесена с ароматен ориз, пресен спанак и подправки, които събуждат апетита. Класическо българско ястие с модерен полъх, идеално за сезона!",
    },
    {
      name: "Петък",
      menu: [
        {"name": "Пилешка супа", "price": "5,00 лв."},
        {"name": "Зеленчукова супа", "price": "5,00 лв."},
        {"name": "Агнешка плешка с ориз и спанак", "price": "15,00 лв."},
        {"name": "Торта Вълшебна целувка", "price": "5,80 лв."},
      ],
      description: "🌿 Агнешко изкушение по пролетному - нежна агнешка плешка, бавно изпечена до съвършенство, поднесена с ароматен ориз, пресен спанак и подправки, които събуждат апетита. Класическо българско ястие с модерен полъх, идеално за сезона!",
      image: "/images/launch/launch4.jpg",
    },
  ];
  return (
    <section id="contact" className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Ресторант-пицария Централ град Добрич</h2>
        <p>
          <span></span> <span className="description-title">Обедно меню</span>
        </p>
        <h2>за периода от 14 до 18 април 2025 година</h2>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <section id="events" className="events section">
          <div className="container-fluid" data-aos="fade-up" data-aos-delay="100">
            <Swiper
              loop={true}
              speed={600}
              autoplay={{ delay: 5000 }}
              slidesPerView="auto"
              pagination={{
                clickable: true,
                el: ".swiper-pagination",
                type: "bullets",
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 40,
                },
                1200: {
                  slidesPerView: 3,
                  spaceBetween: 1,
                },
              }}
              modules={[Autoplay, Pagination]}
            >
              {events.map((day, index) => (
                <SwiperSlide key={day.title + index}>
                  <section id="chefs" className="chefs section">
                  <div
                    className="d-flex align-items-stretch"
                    data-aos="fade-up"
                    data-aos-delay={(index + 1) * 100}
                    key={index}
                    style={{marginRight: "15px"}}
                  >
                    <div className="team-member">
                      <div className="member-img">
                        <img src={day.image} className="img-fluid" alt={day.name} />
                        <div className="social">
                        </div>
                      </div>
                      <div className="member-info">
                        <h4>{day.name}</h4>
                        <span>{day.title}</span>
                        {day.menu.map((item, key) => {
                          return <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span><strong>{item.name}</strong></span>
                          <span>{item.price}</span>
                        </div>
                        })}
                        <p>{day.description}</p>
                      </div>
                    </div>
                  </div>
                  </section>
                </SwiperSlide>
              ))}
              <div className="swiper-pagination"></div>
            </Swiper>
          </div>
        </section>
        <div className="row gy-4">
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="200">
              <i className="icon bi bi-geo-alt flex-shrink-0"></i>
              <div>
                <h3>Адрес</h3>
                <p>гр. Добрич ул. Независимост 4</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="300">
              <i className="icon bi bi-telephone flex-shrink-0"></i>
              <div>
                <h3>Телефон</h3>
                <p>+359 895 516 401 | +359 893 315 201</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="400">
              <i className="icon bi bi-envelope flex-shrink-0"></i>
              <div>
                <h3>Email</h3>
                <p>info@central.bg</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="500">
              <i className="icon bi bi-clock flex-shrink-0"></i>
              <div>
                <h3>Работно време</h3>
                <p>
                  <strong>Понеделник до неделя</strong> 10 - 23
                </p>
                <p>
                  <strong>Обедно меню в работни дни</strong> 11 - 15
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default LaunchMenu;
