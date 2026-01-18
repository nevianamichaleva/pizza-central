'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FAQPage() {
  // FAQPage Schema for SEO and AI
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pizza-central.bg';
  
  // State for managing which FAQ items are open
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(key)) {
      newOpenItems.delete(key);
    } else {
      newOpenItems.add(key);
    }
    setOpenItems(newOpenItems);
  };

  // FAQ categories with questions
  const faqCategories = [
    {
      title: "Доставка и поръчки",
      questions: [
        {
          question: "Как мога да поръчам доставка?",
          answer: <>Можете да поръчате доставка онлайн чрез нашата <Link href="/for-home" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за доставка</Link>, където ще намерите меню, цени и време за доставка.</>,
          answerText: "Можете да поръчате доставка онлайн чрез нашата страница за доставка, където ще намерите меню, цени и време за доставка."
        },
        {
          question: "Какво е времето за доставка?",
          answer: <>Времето за доставка зависи от зоната и натовареността. Обикновено доставката се извършва в рамките на 30-60 минути след потвърждение на поръчката. Точна информация за времето и зоните за доставка е достъпна в <Link href="/for-home" style={{ color: '#ce1212', textDecoration: 'underline' }}>страницата за доставка</Link> преди финализиране на поръчката.</>,
          answerText: "Времето за доставка зависи от зоната и натовареността. Обикновено доставката се извършва в рамките на 30-60 минути след потвърждение на поръчката. Точна информация за времето и зоните за доставка е достъпна в страницата за доставка преди финализиране на поръчката."
        },
        {
          question: "Какви са начините на плащане?",
          answer: "Плащането се извършва в брой при доставка или в ресторанта. Също така можем да договорим друг начин на плащане с клиента. Сайтът не обработва онлайн плащания и не съхранява данни за банкови карти.",
          answerText: "Плащането се извършва в брой при доставка или в ресторанта. Също така можем да договорим друг начин на плащане с клиента. Сайтът не обработва онлайн плащания и не съхранява данни за банкови карти."
        },
        {
          question: "Може ли да се плати с карта?",
          answer: "Да, приемаме плащания с банкови карти в ресторанта. При доставка плащането се извършва в брой.",
          answerText: "Да, приемаме плащания с банкови карти в ресторанта. При доставка плащането се извършва в брой."
        },
        {
          question: "Мога ли да сменя поръчката след потвърждение?",
          answer: <>След потвърждение на поръчката, моля свържете се с нас незабавно на телефон <strong>0895 516401</strong> или <strong>0893 315201</strong>, за да направим промени. Можете също да се свържете чрез нашата <Link href="/contact" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за контакт</Link>.</>,
          answerText: "След потвърждение на поръчката, моля свържете се с нас незабавно на телефон 0895 516401 или 0893 315201, за да направим промени. Можете също да се свържете чрез нашата страница за контакт."
        }
      ]
    },
    {
      title: "Ресторант и резервации",
      questions: [
        {
          question: "Предлагате ли резервации на маси?",
          answer: <>Да, предлагаме резервации на маси. Можете да направите резервация чрез нашата <Link href="/reservation" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за резервации</Link>, като посочите дата, час, брой гости и контактни данни. <strong>Специална оферта:</strong> 10% отстъпка за резервации от неделя до четвъртък.</>,
          answerText: "Да, предлагаме резервации на маси. Можете да направите резервация чрез нашата страница за резервации, като посочите дата, час, брой гости и контактни данни. Специална оферта: 10% отстъпка за резервации от неделя до четвъртък."
        },
        {
          question: "Какво е работното време на ресторанта?",
          answer: <>Работното време на ресторанта е всеки ден от <strong>10:00 до 22:00 часа</strong>. За актуална информация и специални случаи, моля проверете нашата <Link href="/contact" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за контакт</Link>.</>,
          answerText: "Работното време на ресторанта е всеки ден от 10:00 до 22:00 часа. За актуална информация и специални случаи, моля проверете нашата страница за контакт."
        },
        {
          question: "Има ли детски кът?",
          answer: <>Да, ресторантът разполага с детски кът, където децата могат да се забавляват безопасно, докато родителите се наслаждават на храната. За повече информация, разгледайте нашата <Link href="/detski-kut" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за детски кът</Link>.</>,
          answerText: "Да, ресторантът разполага с детски кът, където децата могат да се забавляват безопасно, докато родителите се наслаждават на храната. За повече информация, разгледайте нашата страница за детски кът."
        },
        {
          question: "Какво е работното време на детския кът?",
          answer: <>Детският кът работи в <strong>делнични дни от 17:00 до 22:00 часа</strong>, а <strong>събота и неделя от 10:00 до 22:00 часа</strong>. Също така е достъпен с предварителна уговорка при специални събития за вас.</>,
          answerText: "Детският кът работи в делнични дни от 17:00 до 22:00 часа, а събота и неделя от 10:00 до 22:00 часа. Също така е достъпен с предварителна уговорка при специални събития за вас."
        },
        {
          question: "Каква е цената на детския кът?",
          answer: <>Цената на детския кът е <strong>1,50 евро</strong> на час, и <strong>2,00 евро за почасово гледане на деца</strong>. Следете нашата <Link href="/detski-kut" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за детски кът</Link> за редовните ни промоции на безплатен детски кът за децата.</>,
          answerText: "Цената на детския кът е 1,50 евро на час, и 2,00 евро за почасово гледане на деца. Следете нашата страница за детски кът за редовните ни промоции на безплатен детски кът за децата."
        },
        {
          question: "Мога ли да организирам специални семейни събития в ресторанта в отделна зала?",
          answer: <>Да, предлагаме възможност за организиране на специални семейни събития в отделна зала. Ресторантът е идеално място за семейни вечери и обяди. За резервация и индивидуални оферти, разгледайте нашата <Link href="/catering" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за кетъринг</Link>, <Link href="https://www.pizza-central.bg/blog/restorant-central-family-dinner" style={{ color: '#ce1212', textDecoration: 'underline' }}>статията за семейни вечери</Link> или се свържете с нас чрез <Link href="/contact" style={{ color: '#ce1212', textDecoration: 'underline' }}>страницата за контакт</Link>.</>,
          answerText: "Да, предлагаме възможност за организиране на специални семейни събития в отделна зала. Ресторантът е идеално място за семейни вечери и обяди. За резервация и индивидуални оферти, разгледайте нашата страница за кетъринг, статията за семейни вечери или се свържете с нас чрез страницата за контакт."
        },
        {
          question: "Подходящ ли е ресторантът за детски рождени дни?",
          answer: <>Да, ресторантът е идеален за детски рождени дни. Разполагаме с детски кът, подходящо меню за деца и възрастни, и уютна атмосфера. За повече информация и съвети как да организирате перфектен детски рожден ден, разгледайте нашата <Link href="https://www.pizza-central.bg/blog/detski-rojden-den-dobrich" style={{ color: '#ce1212', textDecoration: 'underline' }}>статия за детски рождени дни</Link>.</>,
          answerText: "Да, ресторантът е идеален за детски рождени дни. Разполагаме с детски кът, подходящо меню за деца и възрастни, и уютна атмосфера. За повече информация и съвети как да организирате перфектен детски рожден ден, разгледайте нашата статия за детски рождени дни."
        },
        {
          question: "Разполагате ли с достъп за трудноподвижни хора?",
          answer: <>Да, ресторантът разполага с достъп за трудноподвижни хора. За повече информация относно достъпността, моля свържете се с нас чрез <Link href="/contact" style={{ color: '#ce1212', textDecoration: 'underline' }}>страницата за контакт</Link>.</>,
          answerText: "Да, ресторантът разполага с достъп за трудноподвижни хора. За повече информация относно достъпността, моля свържете се с нас чрез страницата за контакт."
        },
        {
          question: "Имате ли паркинг?",
          answer: <>Да, ресторантът разполага с паркинг за нашите гости. За повече информация относно местоположението и паркинга, проверете нашата <Link href="/contact" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за контакт</Link>.</>,
          answerText: "Да, ресторантът разполага с паркинг за нашите гости. За повече информация относно местоположението и паркинга, проверете нашата страница за контакт."
        },
        {
          question: "Имате ли детски столчета?",
          answer: "Да, ресторантът разполага с детски столчета за по-малките деца. Моля, уточнете при резервация, ако имате нужда от детско столче.",
          answerText: "Да, ресторантът разполага с детски столчета за по-малките деца. Моля, уточнете при резервация, ако имате нужда от детско столче."
        },
        {
          question: "Имате ли Wi-Fi?",
          answer: "Да, ресторантът предлага безплатен Wi-Fi за нашите гости. Можете да поискате паролата от обслужващия персонал.",
          answerText: "Да, ресторантът предлага безплатен Wi-Fi за нашите гости. Можете да поискате паролата от обслужващия персонал."
        }
      ]
    },
    {
      title: "Меню и храна",
      questions: [
        {
          question: "Имате ли вегетариански и детски менюта?",
          answer: <>Да, предлагаме разнообразни вегетариански опции и специално детско меню, подходящо за деца. Можете да разгледате <Link href="/our-menu" style={{ color: '#ce1212', textDecoration: 'underline' }}>пълното меню онлайн</Link>, където ще намерите всички опции.</>,
          answerText: "Да, предлагаме разнообразни вегетариански опции и специално детско меню, подходящо за деца. Можете да разгледате пълното меню онлайн, където ще намерите всички опции."
        },
        {
          question: "Предлагате ли обедно меню?",
          answer: <>Да, предлагаме ежедневно обедно меню с разнообразни ястия на достъпни цени. Разгледайте нашата <Link href="/obedno-menu" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за обедно меню</Link>, за да видите актуалните предложения.</>,
          answerText: "Да, предлагаме ежедневно обедно меню с разнообразни ястия на достъпни цени. Разгледайте нашата страница за обедно меню, за да видите актуалните предложения."
        },
        {
          question: "Предлагате ли кетъринг?",
          answer: <>Да, предлагаме професионален кетъринг за фирмени и лични събития. Разгледайте нашата <Link href="/catering" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за кетъринг</Link> за повече информация и индивидуални оферти.</>,
          answerText: "Да, предлагаме професионален кетъринг за фирмени и лични събития. Разгледайте нашата страница за кетъринг за повече информация и индивидуални оферти."
        },
        {
          question: "Имате ли оферти за празници и специални събития?",
          answer: <>Да, предлагаме специални оферти и менюта за празници и специални събития. За повече информация и индивидуални оферти, разгледайте нашата <Link href="/catering" style={{ color: '#ce1212', textDecoration: 'underline' }}>страница за кетъринг</Link> или се свържете с нас.</>,
          answerText: "Да, предлагаме специални оферти и менюта за празници и специални събития. За повече информация и индивидуални оферти, разгледайте нашата страница за кетъринг или се свържете с нас."
        },
        {
          question: "Алергени и съставки?",
          answer: <>Информация за алергени и съставки е достъпна в нашето меню. Можете да разгледате <Link href="/our-menu" style={{ color: '#ce1212', textDecoration: 'underline' }}>пълното меню онлайн</Link> или да се свържете с нас за допълнителна информация относно конкретни ястия.</>,
          answerText: "Информация за алергени и съставки е достъпна в нашето меню. Можете да разгледате пълното меню онлайн или да се свържете с нас за допълнителна информация относно конкретни ястия."
        },
        {
          question: "Може ли промяна в ястие?",
          answer: <>Да, в много случаи можем да направим промени в ястията според вашите предпочитания или алергии. Моля, уточнете вашите изисквания при поръчката или се свържете с нас на телефон <strong>0895 516401</strong> или <strong>0893 315201</strong>.</>,
          answerText: "Да, в много случаи можем да направим промени в ястията според вашите предпочитания или алергии. Моля, уточнете вашите изисквания при поръчката или се свържете с нас на телефон 0895 516401 или 0893 315201."
        },
        {
          question: "Какво означава \"Нови предложения\"?",
          answer: <>"Нови предложения" е раздел в нашето меню, където представяме най-новите ястия и промоции. Можете да разгледате <Link href="/new-dishes" style={{ color: '#ce1212', textDecoration: 'underline' }}>новите предложения</Link>, за да видите актуалните нови ястия и оферти.</>,
          answerText: "Нови предложения е раздел в нашето меню, където представяме най-новите ястия и промоции. Можете да разгледате новите предложения, за да видите актуалните нови ястия и оферти."
        }
      ]
    }
  ];

  // Flatten all questions for JSON-LD schema
  const allQuestions = faqCategories.flatMap(category => category.questions);

  // Generate FAQPage Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allQuestions.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answerText || (typeof item.answer === 'string' ? item.answer : item.question)
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="section" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-10 col-lg-offset-1" style={{ margin: '0 auto' }}>
              <article style={{
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
                  Често задавани въпроси
                </h1>

                <div style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#333'
                }}>
                  {faqCategories.map((category, categoryIndex) => (
                    <section key={categoryIndex} style={{ marginBottom: '30px' }}>
                      <h2 style={{
                        fontSize: '26px',
                        fontWeight: '700',
                        color: '#FF8C42',
                        marginBottom: '20px',
                        paddingBottom: '10px',
                        borderBottom: '2px solid #FF8C42'
                      }}>
                        {category.title}
                      </h2>
                      {category.questions.map((item, questionIndex) => {
                        const key = `${categoryIndex}-${questionIndex}`;
                        const isOpen = openItems.has(key);
                        const questionId = `faq-${categoryIndex}-${questionIndex}`;
                        const answerId = `answer-${categoryIndex}-${questionIndex}`;
                        return (
                          <article
                            key={questionIndex}
                            style={{
                              marginBottom: '15px',
                              borderBottom: '1px solid #e0e0e0',
                              paddingBottom: '15px'
                            }}
                          >
                            <button
                              onClick={() => toggleItem(categoryIndex, questionIndex)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                padding: '15px 0',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#333',
                                transition: 'color 0.3s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#FF8C42'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                              aria-expanded={isOpen}
                              aria-controls={answerId}
                              id={questionId}
                              aria-label={`${item.question}. Натиснете за ${isOpen ? 'затваряне' : 'отваряне'} на отговора.`}
                            >
                              <span>{item.question}</span>
                              <span
                                style={{
                                  fontSize: '24px',
                                  fontWeight: 'bold',
                                  transition: 'transform 0.3s ease',
                                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                                  display: 'inline-block',
                                  minWidth: '30px',
                                  textAlign: 'center'
                                }}
                                aria-hidden="true"
                                aria-label={isOpen ? 'Затвори' : 'Отвори'}
                              >
                                +
                              </span>
                            </button>
                            <div
                              id={answerId}
                              role="region"
                              aria-labelledby={questionId}
                              style={{
                                maxHeight: isOpen ? '1000px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease, padding 0.3s ease',
                                paddingTop: isOpen ? '10px' : '0',
                                paddingBottom: isOpen ? '10px' : '0',
                                paddingLeft: '0',
                                paddingRight: '0'
                              }}
                            >
                              <div 
                                style={{
                                  paddingLeft: '0',
                                  paddingRight: '0',
                                  color: '#555',
                                  lineHeight: '1.8',
                                  fontSize: '18px'
                                }}
                              >
                                {item.answer}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </section>
                  ))}

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
              </article>
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
            h2[style*="fontSize: '26px'"] {
              font-size: 22px !important;
            }
            button[style*="fontSize: '20px'"] {
              font-size: 18px !important;
            }
          }
        `}</style>
      </section>
    </>
  );
}
