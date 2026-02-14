'use client';

/**
 * Плаващи сърца в hero – любовен ефект без да претоварва съдържанието.
 * Сърцата се движат нагоре с леко люлеене и избледняват.
 */
const HEARTS = [
  { left: '8%', size: 22, delay: 0, duration: 7, drift: 8 },
  { left: '18%', size: 16, delay: 0.5, duration: 8, drift: -6 },
  { left: '28%', size: 26, delay: 1, duration: 6, drift: 5 },
  { left: '42%', size: 19, delay: 0.2, duration: 7.5, drift: -4 },
  { left: '55%', size: 24, delay: 0.8, duration: 6.5, drift: 7 },
  { left: '68%', size: 17, delay: 1.2, duration: 8.5, drift: -5 },
  { left: '78%', size: 23, delay: 0.6, duration: 7, drift: 6 },
  { left: '88%', size: 14, delay: 1.5, duration: 9, drift: -3 },
  { left: '22%', size: 20, delay: 1.8, duration: 7.5, drift: -7 },
  { left: '52%', size: 16, delay: 1.1, duration: 8, drift: 4 },
  { left: '72%', size: 26, delay: 0.4, duration: 5.5, drift: -6 },
];

function HeartIcon({ size, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export default function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {HEARTS.map((h, i) => (
        <div
          key={i}
          className="floating-heart"
          style={{
            '--left': h.left,
            '--size': `${h.size}px`,
            '--delay': `${h.delay}s`,
            '--duration': `${h.duration}s`,
            '--drift': `${h.drift}px`,
          }}
        >
          <HeartIcon size={h.size} className="heart-svg" />
        </div>
      ))}
      <style jsx>{`
        .floating-hearts {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .floating-heart {
          position: absolute;
          left: var(--left);
          bottom: -30px;
          width: var(--size);
          height: var(--size);
          color: rgba(212, 19, 23, 0.52);
          animation: floatUp var(--duration) ease-in-out var(--delay) infinite;
        }

        .floating-heart:nth-child(odd) .heart-svg {
          color: rgba(200, 15, 20, 0.48);
        }

        .heart-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 8px rgba(212, 19, 23, 0.35));
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 0.7;
          }
          50% {
            transform: translateY(-50vh) translateX(var(--drift)) rotate(12deg);
            opacity: 0.5;
          }
          92% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) translateX(calc(var(--drift) * 1.5)) rotate(20deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
