const EUR_RATE = 1.95583;

const ALLERGEN_ORDER = [
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soybeans',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs',
];

export function isProductForRestaurant(product) {
  if (!product || product.isSideDish) return false;
  // Match admin defaults: missing flag means active for restaurant
  return product.forRestaurant !== false;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(value) {
  if (!value) return '';
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatEuro(price) {
  const num = parseFloat(price);
  if (Number.isNaN(num)) return '';
  return `${(num / EUR_RATE).toFixed(2).replace('.', ',')} €`;
}

function getAllergenNumbers(allergens) {
  if (!allergens) return '';
  const values = Array.isArray(allergens) ? allergens : [allergens];
  return values
    .map((value) => ALLERGEN_ORDER.indexOf(value) + 1)
    .filter((n) => n > 0)
    .sort((a, b) => a - b)
    .join(',');
}

function productBelongsToCategory(product, categoryId) {
  const productCategories =
    product.categories && Array.isArray(product.categories) && product.categories.length > 0
      ? product.categories
      : product.category
        ? [product.category]
        : [];
  return productCategories.includes(categoryId);
}

function buildItemsHtml(products) {
  return products
    .map((product, index) => {
      const allergens = getAllergenNumbers(product.allergens);
      const weight = product.weight ? `${escapeHtml(String(product.weight).trim())} гр.` : '';
      const price = formatEuro(product.price);
      const meta = [weight, price].filter(Boolean).join(' ');
      const details = stripHtml(product.ingredients) || stripHtml(product.description);

      return `
        <article class="menu-item">
          <div class="menu-item-row">
            <div class="menu-item-title">
              <span class="menu-item-name">${index + 1}. ${escapeHtml(product.name || '')}</span>
              ${allergens ? `<sup class="menu-allergens">${escapeHtml(allergens)}</sup>` : ''}
            </div>
            <div class="menu-item-meta">${escapeHtml(meta)}</div>
          </div>
          ${details ? `<p class="menu-item-details">${escapeHtml(details)}</p>` : ''}
        </article>
      `;
    })
    .join('');
}

function buildPrintHtml({ categoryName, categoryDescription, products, logoUrl }) {
  const title = escapeHtml((categoryName || 'Меню').toUpperCase());
  const description = escapeHtml(stripHtml(categoryDescription || ''));
  const itemsHtml = buildItemsHtml(products);

  return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <title>${title} — Централ</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #111;
    }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      position: relative;
      width: 190mm;
      min-height: 277mm;
      margin: 0 auto;
      padding: 18mm 16mm 20mm;
      background: #fff;
    }
    .frame {
      position: absolute;
      inset: 6mm;
      border: 1.2px solid #111;
      pointer-events: none;
    }
    .frame::before,
    .frame::after {
      content: "";
      position: absolute;
      width: 34mm;
      height: 34mm;
      background-repeat: no-repeat;
      background-size: contain;
    }
    .frame::before {
      top: -1px;
      left: -1px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.4' d='M18 102 V28 Q18 18 28 18 H102'/%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.1' d='M30 18 C38 8 52 8 58 18 C64 8 78 8 86 18'/%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.1' d='M18 30 C8 38 8 52 18 58 C8 64 8 78 18 86'/%3E%3Ccircle cx='18' cy='18' r='2' fill='%23111'/%3E%3C/svg%3E");
    }
    .frame::after {
      top: -1px;
      right: -1px;
      transform: scaleX(-1);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.4' d='M18 102 V28 Q18 18 28 18 H102'/%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.1' d='M30 18 C38 8 52 8 58 18 C64 8 78 8 86 18'/%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.1' d='M18 30 C8 38 8 52 18 58 C8 64 8 78 18 86'/%3E%3Ccircle cx='18' cy='18' r='2' fill='%23111'/%3E%3C/svg%3E");
    }
    .frame-bottom-left,
    .frame-bottom-right {
      position: absolute;
      width: 34mm;
      height: 34mm;
      background-repeat: no-repeat;
      background-size: contain;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.4' d='M18 102 V28 Q18 18 28 18 H102'/%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.1' d='M30 18 C38 8 52 8 58 18 C64 8 78 8 86 18'/%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.1' d='M18 30 C8 38 8 52 18 58 C8 64 8 78 18 86'/%3E%3Ccircle cx='18' cy='18' r='2' fill='%23111'/%3E%3C/svg%3E");
    }
    .frame-bottom-left { bottom: -1px; left: -1px; transform: scaleY(-1); }
    .frame-bottom-right { bottom: -1px; right: -1px; transform: scale(-1); }
    .header { text-align: center; margin-bottom: 8mm; }
    .logo {
      width: 38mm;
      height: auto;
      display: block;
      margin: 0 auto 5mm;
      filter: invert(1);
    }
    .category-title {
      margin: 0;
      font-size: 28pt;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .category-flourish {
      width: 42mm;
      height: 8mm;
      margin: 2mm auto 0;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 40'%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.4' d='M10 20 H85'/%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.3' d='M95 20 C102 8 118 8 110 20 C118 32 102 32 95 20 Z'/%3E%3Cpath fill='none' stroke='%23111' stroke-width='1.4' d='M135 20 H210'/%3E%3C/svg%3E");
    }
    .menu-list { display: flex; flex-direction: column; gap: 5.5mm; }
    .menu-item { break-inside: avoid; page-break-inside: avoid; }
    .menu-item-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 4mm;
    }
    .menu-item-title {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 13.5pt;
      font-weight: 700;
      line-height: 1.25;
    }
    .menu-allergens {
      font-size: 8.5pt;
      font-weight: 600;
      margin-left: 1.5mm;
      vertical-align: super;
    }
    .menu-item-meta {
      flex: 0 0 auto;
      white-space: nowrap;
      font-size: 12.5pt;
      font-weight: 600;
    }
    .menu-item-details {
      margin: 1.2mm 0 0;
      font-size: 10.5pt;
      font-weight: 500;
      line-height: 1.35;
      color: #222;
    }
    .footer {
      margin-top: 10mm;
      text-align: center;
      font-family: Georgia, "Times New Roman", serif;
      font-style: italic;
      font-size: 13pt;
      line-height: 1.45;
      max-width: 150mm;
      margin-left: auto;
      margin-right: auto;
    }
    @media print {
      .page {
        width: auto;
        min-height: auto;
        margin: 0;
        padding: 12mm 10mm 14mm;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <div class="frame">
      <span class="frame-bottom-left"></span>
      <span class="frame-bottom-right"></span>
    </div>
    <header class="header">
      <img class="logo" src="${escapeHtml(logoUrl)}" alt="Central pizza restaurant" />
      <h1 class="category-title">${title}</h1>
      <div class="category-flourish" aria-hidden="true"></div>
    </header>
    <section class="menu-list">
      ${itemsHtml}
    </section>
    ${description ? `<footer class="footer">${description}</footer>` : ''}
  </main>
</body>
</html>`;
}

/**
 * Builds print-ready HTML for a restaurant category menu.
 */
export function buildRestaurantMenuPrint({ category, products, origin }) {
  if (!category?.id) {
    return { ok: false, reason: 'no-category' };
  }

  const restaurantProducts = (products || []).filter(
    (product) => isProductForRestaurant(product) && productBelongsToCategory(product, category.id)
  );

  if (restaurantProducts.length === 0) {
    return { ok: false, reason: 'empty' };
  }

  const baseOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const html = buildPrintHtml({
    categoryName: category.name,
    categoryDescription: category.menuDescription || category.description || '',
    products: restaurantProducts,
    logoUrl: `${baseOrigin}/images/logo.png`,
  });

  return {
    ok: true,
    html,
    count: restaurantProducts.length,
    title: category.name || 'Меню',
  };
}

/**
 * Prints HTML via a temporary hidden iframe (no popup window).
 */
export function printHtmlDocument(html) {
  if (typeof window === 'undefined' || !html) return false;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'menu-print');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDocument = frameWindow?.document;
  if (!frameWindow || !frameDocument) {
    document.body.removeChild(iframe);
    return false;
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1000);
  };

  const doPrint = () => {
    try {
      frameWindow.focus();
      frameWindow.print();
    } finally {
      cleanup();
    }
  };

  // Wait briefly for images/styles inside the iframe
  setTimeout(doPrint, 400);
  return true;
}
