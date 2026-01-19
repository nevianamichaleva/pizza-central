'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <section className="section" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-lg-offset-1" style={{ margin: '0 auto' }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#ce1212',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                Общи условия за ползване
              </h1>

              <div style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#333'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  1. Общи положения
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Настоящите Общи условия уреждат правилата за използване на уебсайта <strong>https://www.pizza-central.bg</strong>, собственост на <strong>Нолина 2007 ЕООД</strong>, както и условията за извършване на онлайн поръчки и резервации за маси чрез сайта.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  С използването на сайта Вие се съгласявате с настоящите Общи условия.
                </p>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  2. Данни за търговеца
                </h2>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}><strong>Нолина 2007 ЕООД</strong></li>
                  <li style={{ marginBottom: '10px' }}>ЕИК: 148104173</li>
                  <li style={{ marginBottom: '10px' }}>Адрес: София, р-н Младост, бул. "Цариградско шосе" 145, ет.6, ап.26</li>
                  <li style={{ marginBottom: '10px' }}>Телефон: 0895 516401</li>
                  <li style={{ marginBottom: '10px' }}>Имейл: <a href="mailto:pizzacentraldobrich@gmail.com" style={{ color: '#ce1212' }}>pizzacentraldobrich@gmail.com</a></li>
                </ul>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  3. Услуги, предоставяни чрез сайта
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Чрез сайта потребителите могат:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}>да разглеждат менюто на ресторанта</li>
                  <li style={{ marginBottom: '10px' }}>да правят онлайн поръчки за храна</li>
                  <li style={{ marginBottom: '10px' }}>да правят резервации за маси</li>
                  <li style={{ marginBottom: '10px' }}>по желание да създадат потребителски профил</li>
                </ul>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  4. Онлайн поръчки
                </h2>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#333',
                  marginTop: '20px',
                  marginBottom: '10px'
                }}>
                  4.1. Как се прави онлайн поръчка
                </h3>
                <p style={{ marginBottom: '20px' }}>
                  Онлайн поръчка се прави чрез попълване на необходимите данни – име, телефон, адрес за доставка и имейл.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Поръчката се счита за приета след потвърждение от страна на ресторанта (по телефон или друг начин).
                </p>

                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#333',
                  marginTop: '20px',
                  marginBottom: '10px'
                }}>
                  4.2. Плащане
                </h3>
                <p style={{ marginBottom: '20px' }}>
                  Плащането се извършва извън сайта – в брой или по друг начин, договорен с клиента.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Сайтът не обработва онлайн плащания и не съхранява данни за банкови карти.
                </p>

                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#333',
                  marginTop: '20px',
                  marginBottom: '10px'
                }}>
                  4.3. Доставка
                </h3>
                <p style={{ marginBottom: '20px' }}>
                  Информация за цените, зоните и времето за доставка е публикувана в сайта и е достъпна преди финализиране на поръчката.
                </p>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  5. Право на отказ и рекламации
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Съгласно действащото законодателство, за приготвена храна не се прилага право на отказ след започване на изпълнението.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  При проблем с поръчка, клиентът може да подаде рекламация, като се свърже с ресторанта на посочените контакти.
                </p>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  6. Резервации за маси
                </h2>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#333',
                  marginTop: '20px',
                  marginBottom: '10px'
                }}>
                  6.1. Как се прави резервация за маса
                </h3>
                <p style={{ marginBottom: '20px' }}>
                  Резервация за маса може да се направи чрез сайта, като се посочат дата, час, брой гости и контактни данни.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Резервацията се счита за валидна след потвърждение от ресторанта.
                </p>

                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#333',
                  marginTop: '20px',
                  marginBottom: '10px'
                }}>
                  6.2. Закъснение и анулиране
                </h3>
                <p style={{ marginBottom: '20px' }}>
                  Ресторантът си запазва правото да освободи резервацията при закъснение над 15 минути, ако клиентът не се е свързал предварително.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Клиентът може да анулира резервацията, като се свърже с ресторанта своевременно.
                </p>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  7. Потребителски профили
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Регистрацията в сайта не е задължителна.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Потребителят носи отговорност за достоверността на предоставените данни и за запазването на данните за достъп до профила си.
                </p>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  8. Отговорност
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Ресторантът не носи отговорност за:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}>временна недостъпност на сайта</li>
                  <li style={{ marginBottom: '10px' }}>технически проблеми извън неговия контрол</li>
                  <li style={{ marginBottom: '10px' }}>неточности, причинени от грешно въведени данни от потребителя</li>
                </ul>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  9. Интелектуална собственост
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Всички текстове, изображения и съдържание в сайта са собственост на <strong>Нолина 2007 ЕООД</strong> и не могат да бъдат използвани без изрично разрешение.
                </p>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  10. Лични данни
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Обработването на лични данни се извършва съгласно <Link href="/privacy-policy" style={{ color: '#ce1212', textDecoration: 'underline' }}>Политиката за личните данни</Link>, публикувана на сайта.
                </p>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  11. Приложимо право
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  За всички неуредени въпроси се прилага действащото законодателство на Република България.
                </p>

                <div style={{
                  marginTop: '40px',
                  paddingTop: '20px',
                  borderTop: '2px solid #e0e0e0',
                  textAlign: 'center'
                }}>
                  <Link href="/" style={{
                    color: '#ce1212',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}>
                    ← Назад към началната страница
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .col-lg-10 {
            padding: 0 15px;
          }
          div[style*="padding: '40px'"] {
            padding: 20px !important;
          }
          h1[style*="fontSize: '32px'"] {
            font-size: 24px !important;
          }
          h2[style*="fontSize: '24px'"] {
            font-size: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}

