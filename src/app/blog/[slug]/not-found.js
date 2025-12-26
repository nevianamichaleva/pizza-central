import Link from "next/link";
import { Button } from "antd";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
            Статията не е намерена
          </p>
          <Link href="/blog">
            <Button type="primary" size="large">
              Върни се към блога
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

