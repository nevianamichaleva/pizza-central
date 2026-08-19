import { Button } from "antd";
import Link from "next/link";

export const metadata = {
  title: "Страницата не е намерена",
  description: "Страницата, която търсите, не съществува или е преместена.",
};

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div
          className="d-flex flex-column align-items-center justify-content-center text-center"
          style={{
            minHeight: "60vh",
            padding: "60px 20px",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(72px, 15vw, 140px)",
              fontWeight: 700,
              marginBottom: "16px",
              color: "#c9a227",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            404
          </h1>
          <h2
            style={{
              fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
              fontWeight: 600,
              marginBottom: "12px",
              color: "#333",
            }}
          >
            Страницата не е намерена
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "#666",
              marginBottom: "32px",
              maxWidth: "400px",
            }}
          >
            Съжаляваме, но страницата, която търсите, не съществува или е
            преместена.
          </p>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <Link href="/">
              <Button type="primary" size="large">
                Начало
              </Button>
            </Link>
            <Link href="/for-home">
              <Button size="large">Поръчай за доставка до дома</Button>
            </Link>
            {/* <Link href="/catering/zaiavka">
              <Button size="large">Заяви кетъринг услуги</Button>
            </Link> */}
            <Link href="/reservation">
              <Button size="large">Резервирай маса в ресторанта</Button>
            </Link>
            <Link href="/contact">
              <Button size="large">Контакти</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
