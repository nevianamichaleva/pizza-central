'use client';

import MenuSection from "@/components/MenuSection";

export default function Products() {

  return (
    <>
      <section className="section">
        <div className="container section-title" data-aos="fade-up">
          <h1>Доставка от Ресторант-пицария Централ Добрич</h1>
          <h2>Официален сайт за доставка и takeaway</h2>
          <p style={{ fontSize: '16px', color: '#666', marginTop: '20px', lineHeight: '1.6', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
            Търсите доставка от Ресторант Централ? Поръчайте директно от официалния ни сайт
          </p>
        </div>
      </section>
      <MenuSection hideTitle={true} />
    </>
  );
}
