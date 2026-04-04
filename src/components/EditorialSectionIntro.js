/** Kicker + линия + опционален serif lead — като на началната страница */
export default function EditorialSectionIntro({ kicker, lead, fullWidth = true }) {
  if (!kicker && !lead) return null;
  const wrapClass = fullWidth ? 'container editorial-page-intro' : 'editorial-page-intro editorial-page-intro-inline w-100';
  return (
    <div className={wrapClass}>
      {kicker ? <p className="editorial-kicker">{kicker}</p> : null}
      <div className="editorial-rule" aria-hidden="true" />
      {lead ? <p className="editorial-lead editorial-page-intro-lead">{lead}</p> : null}
    </div>
  );
}
