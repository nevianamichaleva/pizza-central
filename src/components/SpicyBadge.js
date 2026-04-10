/**
 * Показва индикатор за пикантно ястие (поле spicy: true в продукта).
 * Емоджи чушка — до реда с алергени; чрез CSS се подсилва червеният тон.
 */
export default function SpicyBadge({ spicy, title = 'Пикантно', className = '' }) {
  if (spicy !== true) return null;
  return (
    <span
      className={['menu-spicy-badge', 'menu-spicy-badge--emoji', className].filter(Boolean).join(' ')}
      title={title}
      aria-label={title}
      role="img"
    >
      {'\u{1F336}\u{FE0F}'}
    </span>
  );
}
