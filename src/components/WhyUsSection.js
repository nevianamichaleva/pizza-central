import Link from 'next/link';
import { useEffect } from 'react';

const WhyUsSection = () => {
  useEffect(() => {
    const AOS = require('aos');
  }, []);

  return (
    <section id="why-us" className="why-us section light-background">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4">
            <div className="why-box">
              <h3>Защо да изберете вкуса на „Централ“?</h3>
              <p> 🍕 <strong>Истински вкус</strong> – приготвяме пиците си по италиански рецепти, но с най-добрите български продукти. </p>
              <p>  🥗 <strong>Апетитни предложения</strong> – свежи салати, хрупкави предястия и вкусни основни ястия за всеки вкус. </p>
              <div className="text-center">
                <Link className="more-btn" href="/about-us" passHref>
                  <span>Научете повече</span> <i className="bi bi-chevron-right"></i>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-8 d-flex align-items-stretch">
            <div className="row gy-4">
              <div className="col-xl-4">
                <div className="icon-box d-flex flex-column justify-content-center align-items-center">
                  <i className="bi-house-door "></i>
                  <h4>Уют и спокойствие</h4>
                  <p>семейна атмосфера, в която храната е удоволствие, а времето спира</p>
                </div>
              </div>
              <div className="col-xl-4">
                <div className="icon-box d-flex flex-column justify-content-center align-items-center">
                  <i className="bi-heart"></i>
                  <h4>За цялото семейство </h4>
                  <p>докато вие се наслаждавате, децата могат да се забавляват в специалния ни детски кът</p>
                </div>
              </div>
              <div className="col-xl-4">
                <div className="icon-box d-flex flex-column justify-content-center align-items-center">
                  <i className="bi-emoji-heart-eyes"></i>
                  <h4>Обслужване с усмивка</h4>
                  <p>защото вярваме, че добрата храна върви ръка за ръка с доброто отношение</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
