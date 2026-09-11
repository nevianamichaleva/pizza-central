'use client'

import { useUser } from '@/context/UserContext';
import { getEuropeSofiaIsoDateString } from '@/lib/launchMenuToday';
import { formatPageViewLabel, pageViewPathToUrl } from '@/lib/trackPageView';
import { get, ref } from 'firebase/database';
import moment from 'moment';
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { rtdb } from '../../../../lib/firebase';

function normalizePageViewDateKey(raw) {
    const s = String(raw || '').trim();
    const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) {
        const [, year, month, day] = iso;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    const dmy = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/);
    if (dmy) {
        let [, day, month, year] = dmy;
        if (year.length === 2) year = `20${year}`;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return '';
}

function buildDateRange(startIso, endIso) {
    const days = [];
    const start = moment(startIso, 'YYYY-MM-DD');
    const end = moment(endIso, 'YYYY-MM-DD');
    if (!start.isValid() || !end.isValid() || start.isAfter(end, 'day')) return days;
    const cursor = start.clone();
    while (cursor.isSameOrBefore(end, 'day')) {
        days.push(cursor.format('YYYY-MM-DD'));
        cursor.add(1, 'day');
    }
    return days;
}

const PageViewsPage = () => {
    const { isAdmin } = useUser();
    const [pageViewsDetails, setPageViewsDetails] = useState([]);
    const [pageViewsData, setPageViewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchDate, setSearchDate] = useState('');
    const [searchPage, setSearchPage] = useState('');

    useEffect(() => {
        if (isAdmin) {
            fetchPageViews();
        }
    }, [isAdmin]);

    const fetchPageViews = async () => {
        setLoading(true);
        try {
            const snapshot = await get(ref(rtdb, "page_views"));

            if (!snapshot.exists()) {
                setPageViewsDetails([]);
                setPageViewsData([]);
                return;
            }

            const data = snapshot.val();
            const details = [];
            const totalsByDate = {};

            Object.entries(data).forEach(([dateKey, dateData]) => {
                const iso = normalizePageViewDateKey(dateKey);
                if (!iso || !dateData || typeof dateData !== 'object') return;

                Object.entries(dateData).forEach(([pagePath, viewsRaw]) => {
                    const views = Number(viewsRaw) || 0;
                    if (views <= 0) return;

                    totalsByDate[iso] = (totalsByDate[iso] || 0) + views;

                    const urlPath = pageViewPathToUrl(pagePath);
                    details.push({
                        date: iso,
                        dateFormatted: moment(iso, 'YYYY-MM-DD').format('DD.MM.YYYY'),
                        page: formatPageViewLabel(urlPath),
                        pagePath: urlPath,
                        views,
                    });
                });
            });

            details.sort((a, b) => {
                if (a.date !== b.date) return b.date.localeCompare(a.date);
                return b.views - a.views;
            });

            const todayIso = getEuropeSofiaIsoDateString() || moment().format('YYYY-MM-DD');
            const startIso = moment(todayIso, 'YYYY-MM-DD').subtract(13, 'days').format('YYYY-MM-DD');

            const chartDays = buildDateRange(startIso, todayIso).map((fullDate) => ({
                date: moment(fullDate, 'YYYY-MM-DD').format('DD.MM'),
                fullDate,
                count: totalsByDate[fullDate] || 0,
            }));

            setPageViewsDetails(details);
            setPageViewsData(chartDays);
        } catch (error) {
            console.error("Грешка при зареждане на посещения на страници:", error);
            setPageViewsDetails([]);
            setPageViewsData([]);
        } finally {
            setLoading(false);
        }
    };

    // Най-посещавани страници за днес (за графиката)
    const mostVisitedToday = useMemo(() => {
        const todayStr = getEuropeSofiaIsoDateString() || moment().format('YYYY-MM-DD');
        return pageViewsDetails
            .filter(item => item.date === todayStr)
            .sort((a, b) => b.views - a.views)
            .slice(0, 15)
            .map(item => ({ page: item.page, views: item.views }));
    }, [pageViewsDetails]);

    // Filter data based on search
    const filteredData = pageViewsDetails.filter(item => {
        const matchesDate = !searchDate || item.dateFormatted.includes(searchDate) || item.date.includes(searchDate);
        const matchesPage = !searchPage || 
            item.page.toLowerCase().includes(searchPage.toLowerCase()) ||
            item.pagePath.toLowerCase().includes(searchPage.toLowerCase());
        return matchesDate && matchesPage;
    });

    if (!isAdmin) {
        return <section id="contact" className="contact section">
            <div className="container">
                <div className="container section-title">
                    <h2>Ресторант-пицария Централ</h2>
                    <p>
                        <span></span> <span className="description-title">Нямате права за тази страница</span>
                    </p>
                </div>
            </div>
        </section>;
    }

    return (
        <section id="contact" className="contact section">
            <div className="container" style={{ maxWidth: '1400px' }}>
                <div className="container section-title">
                    <h2>Ресторант-пицария Централ</h2>
                    <p>
                        <span></span> <span className="description-title">Виж какво правят потребителите</span>
                    </p>
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
                        <i className="bi bi-arrow-left"></i> Върни се в Административния панел
                    </Link>
                </div>

                {/* Page Views Chart */}
                <div style={{ 
                    background: '#fff', 
                    padding: '24px', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                        Посещения на страници - Последни 14 дни
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={pageViewsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" interval={0} />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                labelFormatter={(_, payload) => {
                                    const full = payload?.[0]?.payload?.fullDate;
                                    return full
                                        ? moment(full, 'YYYY-MM-DD').format('DD.MM.YYYY')
                                        : '';
                                }}
                            />
                            <Legend />
                            <Line 
                                type="monotone"
                                dataKey="count" 
                                stroke="#fa8c16" 
                                strokeWidth={2}
                                name="Брой посещения"
                                dot={{ r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Най-посещавани страници за днес */}
                <div style={{ 
                    background: '#fff', 
                    padding: '24px', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                        Най-посещавани страници за днес
                    </h3>
                    {mostVisitedToday.length > 0 ? (
                        <ResponsiveContainer width="100%" height={Math.max(300, mostVisitedToday.length * 36)}>
                            <BarChart
                                data={mostVisitedToday}
                                layout="vertical"
                                margin={{ left: 20, right: 30, top: 5, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="page" width={180} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => [value, 'Посещения']} />
                                <Legend />
                                <Bar dataKey="views" fill="#1890ff" name="Посещения" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
                            Няма данни за посещения днес
                        </div>
                    )}
                </div>

            {/* Search Filters */}
                <div style={{ 
                    background: '#fff', 
                    padding: '20px', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '15px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Търсене по дата:
                        </label>
                        <input
                            type="text"
                            placeholder="Напр. 15.01 или 2024-01-15"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Търсене по страница:
                        </label>
                        <input
                            type="text"
                            placeholder="Напр. about-us, products..."
                            value={searchPage}
                            onChange={(e) => setSearchPage(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                            onClick={() => {
                                setSearchDate('');
                                setSearchPage('');
                            }}
                            style={{
                                padding: '8px 16px',
                                background: '#f5f5f5',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Изчисти
                        </button>
                    </div>
                </div>

                {/* Detailed Table */}
                <div style={{ 
                    background: '#fff', 
                    padding: '24px', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                        Детайлни посещения по страници
                    </h3>
                    
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <p>Зареждане на данни...</p>
                        </div>
                    ) : filteredData.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'collapse',
                                fontSize: '14px'
                            }}>
                                <thead>
                                    <tr style={{ 
                                        background: '#fafafa',
                                        borderBottom: '2px solid #f0f0f0'
                                    }}>
                                        <th style={{ 
                                            padding: '12px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            borderRight: '1px solid #f0f0f0'
                                        }}>Дата</th>
                                        <th style={{ 
                                            padding: '12px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            borderRight: '1px solid #f0f0f0'
                                        }}>Страница</th>
                                        <th style={{ 
                                            padding: '12px',
                                            textAlign: 'right',
                                            fontWeight: '600'
                                        }}>Брой посещения</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => (
                                        <tr 
                                            key={index}
                                            style={{ 
                                                borderBottom: '1px solid #f0f0f0',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#fafafa';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <td style={{ 
                                                padding: '12px',
                                                borderRight: '1px solid #f0f0f0',
                                                fontWeight: '500'
                                            }}>
                                                {item.dateFormatted}
                                            </td>
                                            <td style={{ 
                                                padding: '12px',
                                                borderRight: '1px solid #f0f0f0'
                                            }}>
                                                {item.page}
                                            </td>
                                            <td style={{ 
                                                padding: '12px',
                                                textAlign: 'right',
                                                fontWeight: '600',
                                                color: '#fa8c16'
                                            }}>
                                                {item.views.toLocaleString('bg-BG')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ 
                                        background: '#fafafa',
                                        borderTop: '2px solid #f0f0f0'
                                    }}>
                                        <td style={{ 
                                            padding: '12px',
                                            fontWeight: '600',
                                            borderRight: '1px solid #f0f0f0'
                                        }} colSpan="2">
                                            Общо:
                                        </td>
                                        <td style={{ 
                                            padding: '12px',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: '#fa8c16',
                                            fontSize: '16px'
                                        }}>
                                            {filteredData.reduce((sum, item) => sum + item.views, 0).toLocaleString('bg-BG')}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px',
                            color: '#999'
                        }}>
                            {searchDate || searchPage 
                                ? 'Няма резултати за търсеното' 
                                : 'Няма данни за посещения'}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PageViewsPage;
