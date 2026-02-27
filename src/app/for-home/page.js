'use client';

import MenuSection from "@/components/MenuSection";
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function Products() {
  const { user } = useUser();

  return (
    <>
      <section className="section">
        <div className="container section-title">
          <h1>Доставка от Ресторант-пицария Централ Добрич</h1>
          <h2>Официален сайт за доставка и takeaway</h2>
          <p style={{ fontSize: '15px', color: '#ce1212', marginTop: '16px', lineHeight: '1.5', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto', fontWeight: '600' }}>
          Поръчайте директно от официалния ни сайт и се насладете на 5% отстъпка за регистрирани потребители • 10% отстъпка при вземане от място
          </p>
          {!user && (
            <p style={{ marginTop: '8px' }}>
              <Link href="/signup" style={{ fontSize: '17px', textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
                Регистрация <i className="bi bi-arrow-right"></i>
              </Link>
            </p>
          )}
        </div>
      </section>
      <MenuSection hideTitle={true} />
    </>
  );
}
