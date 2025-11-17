'use client';

import { useCategories } from '@/context/CategoriesContext';
import { useProducts } from '@/context/ProductsContext';
import { useMemo } from 'react';

function normalizePrice(rawPrice) {
  if (rawPrice === undefined || rawPrice === null) {
    return null;
  }
  if (typeof rawPrice === 'number') {
    return Number.isFinite(rawPrice) ? rawPrice : null;
  }
  const cleaned = String(rawPrice).replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPrice(price) {
  const normalized = normalizePrice(price);
  if (normalized === null) return null;
  const priceInLv = normalized.toFixed(2);
  const priceInEuro = (normalized / 1.95583).toFixed(2);
  return `${priceInLv} лв / ${priceInEuro} €`;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function CentralMenuPage() {
  const { categories, loading: loadingCategories } = useCategories();
  const { products, loading: loadingProducts } = useProducts();

  const TOP_CATEGORIES_ID = 'central-menu-categories';

  const handleCategoryClick = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (typeof window !== 'undefined' && window.history && window.location) {
        window.history.replaceState(null, '', `#${targetId}`);
      }
    }
  };

  const handleBackToCategories = (e) => {
    e.preventDefault();
    const el = document.getElementById(TOP_CATEGORIES_ID);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (typeof window !== 'undefined' && window.history && window.location) {
        window.history.replaceState(null, '', `#${TOP_CATEGORIES_ID}`);
      }
    }
  };

  const topLevelCategories = useMemo(() => {
    return (categories || []).filter((c) => !c.parent || c.parent === '');
  }, [categories]);

  const categoryIdToProducts = useMemo(() => {
    const map = {};
    for (const item of products || []) {
      const categoryId = item.category;
      if (!categoryId) continue;
      if (!map[categoryId]) map[categoryId] = [];
      map[categoryId].push(item);
    }
    return map;
  }, [products]);

  const subcategoryIdToProducts = useMemo(() => {
    const map = {};
    for (const item of products || []) {
      const subId = item.subcategory;
      if (!subId) continue;
      if (!map[subId]) map[subId] = [];
      map[subId].push(item);
    }
    return map;
  }, [products]);

  if (loadingCategories || loadingProducts) {
    return <div style={{ padding: 18 }}>Зареждане...</div>;
  }

  return (
    <>
      <div className="central-menu-root">
        <div className="header">
          <h1>Ресторант пицария Централ - гр. Добрич</h1>
          <p>Докоснете категория, за да я отворите</p>
        </div>

        <div id={TOP_CATEGORIES_ID} className="grid">
          {topLevelCategories.map((cat) => {
            const targetId = String(cat.id);
            return (
              <a
                key={cat.id}
                href={`#${targetId}`}
                className="card-cat"
                onClick={(e) => handleCategoryClick(e, targetId)}
              >
                <div className="card-title">{cat.name}</div>
                <div className="icon">🍽️</div>
              </a>
            );
          })}
        </div>

        {topLevelCategories.map((cat) => {
          const targetId = String(cat.id);
          const catProducts = categoryIdToProducts[cat.id] || [];
          const children = cat.children || [];
          const hasChildren = Array.isArray(children) && children.length > 0;
          return (
            <section key={cat.id} id={targetId} className="section">
              <h2>{cat.name}</h2>
              <a href={`#${TOP_CATEGORIES_ID}`} className="back-link" onClick={handleBackToCategories}>
                ← Назад към категориите
              </a>

              {hasChildren ? (
                <>
                  {children.map((sub) => {
                    const subProducts = subcategoryIdToProducts[sub.id] || [];
                    if (!subProducts.length) return null;
                    return (
                      <div key={sub.id} style={{ marginTop: 12 }}>
                        <h3 style={{ marginBottom: 10 }}>{sub.name}</h3>
                        {subProducts.map((item) => (
                          <div key={item.id} className="dish">
                            <img
                              className="dish-img"
                              src={item.image || item.img || item.url || '/images/no-image.png'}
                              alt={item.name}
                              loading="lazy"
                            />
                            <div className="dish-title">{item.name}</div>
                            <div className="desc">
                              {item.description || item.ingredients || ''}
                            </div>
                            {formatPrice(item.price) && (
                              <div className="price">{formatPrice(item.price)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  {catProducts.map((item) => (
                    <div key={item.id} className="dish">
                      <img
                        className="dish-img"
                        src={item.image || item.img || item.url || '/images/no-image.png'}
                        alt={item.name}
                        loading="lazy"
                      />
                      <div className="dish-title">{item.name}</div>
                      <div className="desc">
                        {item.description || item.ingredients || ''}
                      </div>
                      {formatPrice(item.price) && (
                        <div className="price">{formatPrice(item.price)}</div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </section>
          );
        })}

      </div>
      <style jsx global>{`
          :root {
            --bg: #fff8ef;
            --card: #ffffff;
            --accent: #ff8a3d;
            --accent2: #ffb875;
            --text: #482c1c;
            --muted: #7a5f4b;
            --radius: 22px;
            --shadow: 0 6px 20px rgba(0,0,0,0.09);
            --shadow-soft: 0 4px 14px rgba(0,0,0,0.06);
            font-family: "Inter", system-ui, sans-serif;
          }
          .central-menu-root {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            padding: 18px;
            -webkit-font-smoothing: antialiased;
            font-size: 16px;
          }
          h1,h2,h3,h4 { margin: 0; font-weight: 700; }
          a { text-decoration: none; color: inherit; }
          .central-menu-root .header { text-align: center; margin-bottom: 18px; }
          .central-menu-root .header h1 { font-size: 26px; margin-bottom: 6px; }
          .central-menu-root .header p { font-size: 14px; color: var(--muted); }
          .central-menu-root .grid { display: grid; gap: 16px; }
          .central-menu-root .card-cat {
            background: var(--card);
            border-radius: var(--radius);
            padding: 18px;
            box-shadow: var(--shadow);
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .central-menu-root .card-cat:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); }
          .central-menu-root .card-title { font-size: 18px; font-weight: 700; color: var(--text); }
          .central-menu-root .icon {
            width: 48px;
            height: 48px;
            background: var(--accent2);
            border-radius: 14px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 26px;
          }
          .central-menu-root .section { margin-top: 28px; scroll-margin-top: 80px; }
          .central-menu-root .section h2 { margin-bottom: 12px; font-size: 22px; }
          .central-menu-root .back-link {
            display: inline-block;
            margin-bottom: 12px;
            color: var(--accent);
            font-weight: 600;
            font-size: 14px;
          }
          .central-menu-root .back-link:hover {
            text-decoration: underline;
          }
          .central-menu-root .dish {
            background: var(--card);
            padding: 14px;
            border-radius: 16px;
            margin-bottom: 14px;
            box-shadow: var(--shadow-soft);
          }
          .central-menu-root .dish-img {
            width: 100%;
            height: auto;
            border-radius: 12px;
            margin-bottom: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.06);
            object-fit: cover;
          }
          .central-menu-root .dish-title { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
          .central-menu-root .desc { color: var(--muted); font-size: 14px; margin-bottom: 8px; }
          .central-menu-root .price { font-weight: 700; font-size: 16px; color: var(--accent); margin-top: 6px; }
          @media (min-width: 720px) {
            .central-menu-root { max-width: 520px; margin: 0 auto; }
          }
      `}</style>
    </>
  );
}


