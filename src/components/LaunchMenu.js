import { default as showAToast } from '@/components/common/showAToast';
import dayjs from 'dayjs';
import 'dayjs/locale/bg';
import isoWeek from 'dayjs/plugin/isoWeek';
import { get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { Autoplay, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import { rtdb } from '../../lib/firebase';

dayjs.extend(isoWeek);
dayjs.locale('bg');

const LaunchMenu = () => {
  const [launchMenus, setLaunchMenus] = useState([]);
  const [periodText, setPeriodText] = useState('');

  const holidays = [
    '01/01', '03/03', '18/04', '20/04', '01/05',
    '06/05', '24/05', '06/09', '22/09',
    '01/11', '24/12', '25/12', '26/12',
  ];

  const isHoliday = (date) => {
    return holidays.includes(date.format('DD/MM'));
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuRef = ref(rtdb, "launch-menu");
        const snapshot = await get(menuRef);

        if (!snapshot.exists()) {
          showAToast('success', "Не са намерени менюта.");
          return;
        }

        const data = snapshot.val();
        const monday = dayjs().startOf('isoWeek');
        const friday = monday.add(4, 'day');

        const period = monday.month() === friday.month()
          ? `за периода от ${monday.date()} до ${friday.date()} ${friday.format('MMMM')} ${friday.year()} година`
          : `за периода от ${monday.date()} ${monday.format('MMMM')} до ${friday.date()} ${friday.format('MMMM')} ${friday.year()} година`;

        setPeriodText(period);

        const menusThisWeek = Object.entries(data)
          .map(([id, value]) => ({ id, ...value }))
          .filter((menu) => {
            if (!menu.date) return false;

            const [day, month, year] = menu.date.split('/');
            const menuDate = dayjs(`${year}-${month}-${day}`);
            if (!menuDate.isValid()) return false;

            const isInWeek = menuDate.isSame(monday, 'day') || menuDate.isSame(friday, 'day') ||
              (menuDate.isAfter(monday) && menuDate.isBefore(friday));

            return isInWeek && !isHoliday(menuDate);
          }).sort((a, b) => {
            const aDate = dayjs(a.date.split('/').reverse().join('-'));  // Converts to YYYY-MM-DD
            const bDate = dayjs(b.date.split('/').reverse().join('-'));  // Converts to YYYY-MM-DD
            return aDate.isBefore(bDate) ? -1 : aDate.isAfter(bDate) ? 1 : 0;
          });

        setLaunchMenus(menusThisWeek);
      } catch (error) {
        console.error("Firebase error:", error);
        showAToast('error', "Грешка при зареждане на менюта.");
      }
    };

    fetchMenu();
  }, []);

  return (
    <section id="contact" className="contact section">
      <div className="container section-title">
        <h2>Ресторант-пицария Централ град Добрич</h2>
        <p>
          <span className="description-title">Обедно меню</span>
        </p>
        <h2>{periodText}</h2>
      </div>

      <div className="container">
        <section id="events" className="events section">
          <div className="container-fluid">
            <Swiper
              loop={true}
              speed={600}
              autoplay={{ delay: 5000 }}
              slidesPerView="auto"
              pagination={{ clickable: true, el: ".swiper-pagination", type: "bullets" }}
              breakpoints={{
                320: { slidesPerView: 1, spaceBetween: 40 },
                1200: { slidesPerView: 3, spaceBetween: 1 },
              }}
              modules={[Autoplay, Pagination]}
            >
              {launchMenus.map((day, index) => (
                <SwiperSlide key={day.title + index}>
                  <section id="chefs" className="chefs section">
                    <div className="d-flex align-items-stretch">
                      <div className="team-member">
                        <div className="member-img">
                          <img src={day.image} className="img-fluid" alt={day.name} />
                        </div>
                        <div className="member-info">
                          <h4>{day.weekDay}</h4>
                          <span>{day.date}</span>
                          {day.dishes?.map((item, key) => (
                            <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
                              <span><strong>{item.name}</strong></span>
                              <span>{item.price}</span>
                            </div>
                          ))}
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
            <div className="info-item d-flex align-items-center">
              <i className="icon bi bi-geo-alt flex-shrink-0"></i>
              <div>
                <h3>Адрес</h3>
                <p>гр. Добрич ул. Независимост 4</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center">
              <i className="icon bi bi-telephone flex-shrink-0"></i>
              <div>
                <h3>Телефон</h3>
                <p>+359 895 516 401 | +359 893 315 201</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center">
              <i className="icon bi bi-envelope flex-shrink-0"></i>
              <div>
                <h3>Email</h3>
                <p>pizzacentraldobrich@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center">
              <i className="icon bi bi-clock flex-shrink-0"></i>
              <div>
                <h3>Работно време</h3>
                <p><strong>Понеделник до неделя</strong> 10 - 23</p>
                <p><strong>Обедно меню в работни дни</strong> 11 - 15</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LaunchMenu;
