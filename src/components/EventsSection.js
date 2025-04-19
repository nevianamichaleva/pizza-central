import { Autoplay, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "../../node_modules/swiper/swiper-bundle.min.css";


const EventsSection = () => {
  const events = [
    {
      title: "Нощ на изкуството е кухнята на реасторант Централ",
      description:
        'Второто ни събитие с шеф Божков от Hells Kitchen, "Нощ на изкуството в кухнята", беше истински празник за сетивата. Благодарим на всички, които се присъединиха и станаха част от тази незабравима вечер!',
      image: "/images/events-1.jpg",
    },
    {
      title: "Звездите от Hells Kitchen бяха на гости в ресторант Централ Добрич!",
      description:
        "Гостите се насладиха на незабравимо вечерно изживяване с ексклузивно меню, вдъхновено от шоуто, и специални изненади от нашите невероятни кулинарни майстори. 👨‍🍳👩‍🍳 Атмосферата беше повече от вълнуваща, а звездите от Hells Kitchen показаха какво е да си на върха в гастрономията!",
      image: "/images/events-2.png",
    },
    {
      title: "🎉 Детски рождени дни в Ресторант-Пицария Централ 🎂",
      // price: "$499",
      description:
        "Подарете на вашето дете незабравим рожден ден в уютна и весела обстановка! 🥳 В нашия просторен детски кът малките гости ще се забавляват, докато вие се наслаждавате на вкусна храна и приятна атмосфера.",
      image: "/images/events-3.jpg",
    },
    {
      title: "🎊 Вашите незабравими партита в Ресторант-Пицария Централ 🎉",
      description:
        "Празнувайте специалните си моменти при нас и създайте незабравими спомени с близките си! Независимо дали планирате рождени дни, семейни събирания, фирмени тържества или друг повод, ние ще се погрижим за всичко.",
      image: "/images/events-4.jpg",
    },
  ];

  return (
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
          modules={[Autoplay, Pagination]} // Use Swiper modules here
        >
          {events.map((event, index) => (
            <SwiperSlide key={event.title+index}>
              <div
                className="event-item d-flex flex-column justify-content-end"
                style={{ backgroundImage: `url(${event.image})` }}
              >
                <h3>{event.title}</h3>
                <div className="price align-self-start">{event.price}</div>
                <p className="description">{event.description}</p>
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-pagination"></div>
        </Swiper>
      </div>
    </section>
  );
};

export default EventsSection;
