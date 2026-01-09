'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
                Политика за личните данни
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
                  Настоящата Политика за личните данни има за цел да Ви информира как <strong>Нолина 2007 ЕООД</strong> обработва и защитава личните данни на потребителите на уебсайта <strong>pizza-central.bg</strong>.
                </p>
                <p style={{ marginBottom: '20px' }}>
                  Ние обработваме личните Ви данни в съответствие с Регламент (ЕС) 2016/679 (GDPR) и приложимото българско законодателство.
                </p>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  2. Администратор на лични данни
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Администратор на личните данни е:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}><strong>Нолина 2007 ЕООД</strong></li>
                  <li style={{ marginBottom: '10px' }}>ЕИК: 148104173</li>
                  <li style={{ marginBottom: '10px' }}>Адрес: София, р-н Младост, бул. "Цариградско шосе" 145, ет.6, ап.26</li>
                  <li style={{ marginBottom: '10px' }}>Имейл за контакт: <a href="mailto:pizzacentraldobrich@gmail.com" style={{ color: '#ce1212' }}>pizzacentraldobrich@gmail.com</a></li>
                  <li style={{ marginBottom: '10px' }}>Телефон: 0895 516401</li>
                </ul>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  3. Какви лични данни събираме
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  В зависимост от начина, по който използвате сайта, можем да събираме следните лични данни:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}>Име</li>
                  <li style={{ marginBottom: '10px' }}>Телефонен номер</li>
                  <li style={{ marginBottom: '10px' }}>Имейл адрес</li>
                  <li style={{ marginBottom: '10px' }}>Адрес за доставка</li>
                  <li style={{ marginBottom: '10px' }}>Данни за направени поръчки</li>
                  <li style={{ marginBottom: '10px' }}>Данни за регистрация (ако създадете профил)</li>
                  <li style={{ marginBottom: '10px' }}>Технически данни – IP адрес, тип браузър, езикови настройки</li>
                </ul>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  4. За какви цели използваме личните данни
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Личните данни се използват единствено за следните цели:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}>обработка и изпълнение на поръчки</li>
                  <li style={{ marginBottom: '10px' }}>връзка с клиента при въпроси, свързани с поръчката</li>
                  <li style={{ marginBottom: '10px' }}>създаване и управление на потребителски профил (ако е избрана регистрация)</li>
                  <li style={{ marginBottom: '10px' }}>подобряване на работата и сигурността на сайта</li>
                  <li style={{ marginBottom: '10px' }}>изпълнение на законови задължения</li>
                </ul>
                <p style={{
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}>
                  ⚠️ Плащания през сайта не се извършват, и не се съхраняват данни за банкови карти.
                </p>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  5. Основание за обработване
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Обработваме личните Ви данни на основание:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}>изпълнение на договор (поръчка)</li>
                  <li style={{ marginBottom: '10px' }}>съгласие на потребителя</li>
                  <li style={{ marginBottom: '10px' }}>законово задължение</li>
                  <li style={{ marginBottom: '10px' }}>легитимен интерес (сигурност и нормална работа на сайта)</li>
                </ul>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  6. Срок на съхранение
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Личните данни се съхраняват:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}>за периода, необходим за изпълнение на поръчката</li>
                  <li style={{ marginBottom: '10px' }}>за срока, изискуем по закон (например счетоводни документи)</li>
                  <li style={{ marginBottom: '10px' }}>до оттегляне на съгласието, когато обработването се основава на такова</li>
                </ul>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  7. Предоставяне на данни на трети лица
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Личните данни могат да бъдат предоставяни само на:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}>хостинг доставчици</li>
                  <li style={{ marginBottom: '10px' }}>куриерски услуги (за доставка)</li>
                  <li style={{ marginBottom: '10px' }}>държавни органи, когато това се изисква по закон</li>
                </ul>
                <p style={{ marginBottom: '20px' }}>
                  Не предоставяме лични данни за маркетингови цели на трети лица.
                </p>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  8. Права на потребителите
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  Вие имате право:
                </p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}>на достъп до личните си данни</li>
                  <li style={{ marginBottom: '10px' }}>на корекция</li>
                  <li style={{ marginBottom: '10px' }}>на изтриване ("право да бъдеш забравен")</li>
                  <li style={{ marginBottom: '10px' }}>на ограничаване на обработването</li>
                  <li style={{ marginBottom: '10px' }}>на възражение срещу обработването</li>
                  <li style={{ marginBottom: '10px' }}>на жалба до Комисията за защита на личните данни (КЗЛД)</li>
                </ul>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#ce1212',
                  marginTop: '30px',
                  marginBottom: '15px'
                }}>
                  9. Контакт
                </h2>
                <p style={{ marginBottom: '20px' }}>
                  За въпроси, свързани с личните Ви данни, можете да се свържете с нас на:{' '}
                  <a href="mailto:pizzacentraldobrich@gmail.com" style={{ color: '#ce1212', fontWeight: '600' }}>
                    pizzacentraldobrich@gmail.com
                  </a>
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

