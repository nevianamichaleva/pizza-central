import Link from 'next/link';

export default function MenuCatalog({ categories }) {
  if (!categories?.length) return null;

  return (
    <section className="menu-catalog" aria-labelledby="menu-catalog-title">
      <div className="container">
        <h2 id="menu-catalog-title" className="menu-catalog-title">Всички ястия</h2>
        <p className="menu-catalog-lead">
          Категории и ястия от менюто на ресторант-пицария Централ в Добрич.
        </p>
        <nav className="menu-catalog-jump" aria-label="Категории в менюто">
          {categories.map((category) => (
            <a key={category.id} href={`#menu-cat-${category.id}`}>
              {category.name}
            </a>
          ))}
        </nav>
        {categories.map((category) => (
          <div key={category.id} className="menu-catalog-category" id={`menu-cat-${category.id}`}>
            <h3 className="menu-catalog-category-title">{category.name}</h3>
            {category.groups.map((group) => (
              <div key={group.id} className="menu-catalog-group">
                {group.name ? <h4 className="menu-catalog-group-title">{group.name}</h4> : null}
                <ul className="menu-catalog-list">
                  {group.dishes.map((dish) => (
                    <li key={dish.id}>
                      {dish.slug ? (
                        <Link href={`/products/${dish.slug}`}>{dish.name}</Link>
                      ) : (
                        <span>{dish.name}</span>
                      )}
                      {dish.price ? <span className="menu-catalog-price">{dish.price}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
