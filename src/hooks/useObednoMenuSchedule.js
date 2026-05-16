'use client';

import { isObednoMenuOrderingOpen } from '@/lib/obednoMenuSchedule';
import { useEffect, useState } from 'react';

/** Клиентски часовник — обновява се всяка минута, за да се скрие/покаже обедното меню навреме. */
export function useObednoMenuSchedule() {
  const [isObednoOpen, setIsObednoOpen] = useState(() =>
    typeof window !== 'undefined' ? isObednoMenuOrderingOpen() : true,
  );

  useEffect(() => {
    const tick = () => setIsObednoOpen(isObednoMenuOrderingOpen());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return { isObednoOpen };
}
