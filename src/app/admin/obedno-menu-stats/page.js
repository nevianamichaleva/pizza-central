'use client'

import { useUser } from '@/context/UserContext';
import {
  formatMenuDateForDisplay,
  normalizeLaunchMenuDate,
} from '@/lib/launchMenuToday';
import { get, ref } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { rtdb } from '../../../../lib/firebase';

const WEEKDAY_BY_MOMENT = [
  'Неделя',
  'Понеделник',
  'Вторник',
  'Сряда',
  'Четвъртък',
  'Петък',
  'Събота',
];

/** DD/MM/YYYY → YYYY-MM-DD (за page_views ключове) */
function toIsoDateKey(ddmmyyyy) {
  const n = normalizeLaunchMenuDate(ddmmyyyy);
  const parts = n.split('/');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  return `${y}-${m}-${d}`;
}

function weekdayFromDate(ddmmyyyy) {
  const iso = toIsoDateKey(ddmmyyyy);
  if (!iso) return '';
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return WEEKDAY_BY_MOMENT[date.getDay()] || '';
}

function formatMenuText(menu) {
  const parts = [];
  const description = menu?.description != null ? String(menu.description).trim() : '';
  if (description) parts.push(description);

  const dishes = Array.isArray(menu?.dishes) ? menu.dishes : [];
  const dishLines = dishes
    .filter((d) => d && (d.name || d.price))
    .map((d) => {
      const name = d.name ? String(d.name).trim() : '';
      const price = d.price != null && String(d.price).trim() !== '' ? String(d.price).trim() : '';
      const weight = d.weight != null && String(d.weight).trim() !== '' ? String(d.weight).trim() : '';
      let line = name;
      if (weight) line += ` (${weight})`;
      if (price) line += ` — ${price}`;
      return line;
    })
    .filter(Boolean);

  if (dishLines.length) {
    parts.push(dishLines.join('\n'));
  }

  return parts.join('\n\n') || '—';
}

/** Посещения на обедното меню за даден ден (и евентуални alias пътища) */
function getObednoMenuViews(dayData) {
  if (!dayData || typeof dayData !== 'object') return 0;
  const keys = ['obedno-menu', 'launch-menu', 'bg_obedno-menu', 'en_obedno-menu', 'de_obedno-menu'];
  return keys.reduce((sum, key) => sum + (Number(dayData[key]) || 0), 0);
}

const ObednoMenuStatsPage = () => {
  const { isAdmin } = useUser();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuSnap, viewsSnap] = await Promise.all([
        get(ref(rtdb, 'launch-menu')),
        get(ref(rtdb, 'page_views')),
      ]);

      const menus = menuSnap.exists()
        ? Object.entries(menuSnap.val()).map(([id, value]) => ({ id, ...value }))
        : [];
      const pageViews = viewsSnap.exists() ? viewsSnap.val() : {};

      const tableRows = menus
        .filter((menu) => menu?.date)
        .map((menu) => {
          const dateNorm = normalizeLaunchMenuDate(menu.date);
          const isoKey = toIsoDateKey(menu.date);
          const dayViews = isoKey ? pageViews[isoKey] : null;
          const hasViewData = dayViews != null;

          return {
            id: menu.id,
            date: dateNorm,
            dateDisplay: formatMenuDateForDisplay(menu.date),
            isoKey,
            weekDay: menu.weekDay || weekdayFromDate(menu.date),
            menuText: formatMenuText(menu),
            views: hasViewData ? getObednoMenuViews(dayViews) : null,
          };
        })
        .sort((a, b) => {
          if (a.isoKey && b.isoKey) return b.isoKey.localeCompare(a.isoKey);
          return String(b.date).localeCompare(String(a.date));
        });

      setRows(tableRows);
    } catch (error) {
      console.error('Грешка при зареждане на статистика за обедно меню:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchDate.trim()) return rows;
    const q = searchDate.trim().toLowerCase();
    return rows.filter(
      (row) =>
        row.dateDisplay.toLowerCase().includes(q) ||
        row.date.toLowerCase().includes(q) ||
        (row.isoKey && row.isoKey.includes(q)) ||
        (row.weekDay && row.weekDay.toLowerCase().includes(q))
    );
  }, [rows, searchDate]);

  const totalViews = filteredRows.reduce(
    (sum, row) => sum + (row.views != null ? row.views : 0),
    0
  );

  if (!isAdmin) {
    return (
      <section id="contact" className="contact section">
        <div className="container">
          <div className="container section-title">
            <h2>Ресторант-пицария Централ</h2>
            <p>
              <span></span>{' '}
              <span className="description-title">Нямате права за тази страница</span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="contact section">
      <div className="container" style={{ maxWidth: '1400px' }}>
        <div className="container section-title">
          <h2>Ресторант-пицария Централ</h2>
          <p>
            <span></span>{' '}
            <span className="description-title">Обедно меню и посещения по ден</span>
          </p>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <Link
            href="/admin"
            style={{ textDecoration: 'none', color: '#1890ff', fontWeight: 500 }}
          >
            <i className="bi bi-arrow-left"></i> Върни се в Административния панел
          </Link>
        </div>

        <div
          style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Търсене по дата или ден:
            </label>
            <input
              type="text"
              placeholder="Напр. 26.08 или Понеделник"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setSearchDate('')}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Изчисти
          </button>
        </div>

        <div
          style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: '600' }}>
            Текст на обедно меню и посещения по ден
          </h3>
          <p style={{ marginBottom: '20px', color: '#666', fontSize: '13px' }}>
            Посещенията са за страницата /obedno-menu. Данните за посещения се пазят около 7 дни —
            за по-стари дати колоната може да е празна.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Зареждане на данни...</p>
            </div>
          ) : filteredRows.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#fafafa',
                      borderBottom: '2px solid #f0f0f0',
                    }}
                  >
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        borderRight: '1px solid #f0f0f0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Дата
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        borderRight: '1px solid #f0f0f0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Ден от седмицата
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        borderRight: '1px solid #f0f0f0',
                      }}
                    >
                      Текст на обедно меню
                    </th>
                    <th
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Посещения
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        verticalAlign: 'top',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fafafa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td
                        style={{
                          padding: '12px',
                          borderRight: '1px solid #f0f0f0',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.dateDisplay}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          borderRight: '1px solid #f0f0f0',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.weekDay || '—'}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          borderRight: '1px solid #f0f0f0',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.5,
                          maxWidth: '640px',
                        }}
                      >
                        {row.menuText}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: '#fa8c16',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.views != null ? row.views.toLocaleString('bg-BG') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: '#fafafa',
                      borderTop: '2px solid #f0f0f0',
                    }}
                  >
                    <td
                      style={{
                        padding: '12px',
                        fontWeight: '600',
                        borderRight: '1px solid #f0f0f0',
                      }}
                      colSpan={3}
                    >
                      Общо посещения (налични данни):
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#fa8c16',
                        fontSize: '16px',
                      }}
                    >
                      {totalViews.toLocaleString('bg-BG')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#999',
              }}
            >
              {searchDate ? 'Няма резултати за търсеното' : 'Няма записи за обедно меню'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ObednoMenuStatsPage;
