'use client'

import { useUser } from '@/context/UserContext';
import { get, ref, remove } from 'firebase/database';
import moment from 'moment';
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { rtdb } from '../../../../lib/firebase';

const PageViewsPage = () => {
    const { isAdmin } = useUser();
    const [pageViewsDetails, setPageViewsDetails] = useState([]);
    const [pageViewsData, setPageViewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchDate, setSearchDate] = useState('');
    const [searchPage, setSearchPage] = useState('');

    useEffect(() => {
        if (isAdmin) {
            fetchPageViewsDetails();
            fetchPageViewsChartData();
            cleanupOldPageViews();
        }
    }, [isAdmin]);

    const cleanupOldPageViews = async () => {
        try {
            const pageViewsRef = ref(rtdb, "page_views");
            const snapshot = await get(pageViewsRef);
            
            if (!snapshot.exists()) return;

            const data = snapshot.val();
            const sevenDaysAgo = moment().subtract(7, 'days');
            const datesToDelete = [];
            
            // Check each date
            Object.keys(data).forEach(dateStr => {
                const date = moment(dateStr, 'YYYY-MM-DD');
                if (date.isValid() && date.isBefore(sevenDaysAgo, 'day')) {
                    datesToDelete.push(dateStr);
                }
            });

            // Delete old dates
            if (datesToDelete.length > 0) {
                for (const dateToDelete of datesToDelete) {
                    const oldDateRef = ref(rtdb, `page_views/${dateToDelete}`);
                    await remove(oldDateRef);
                }
            }
        } catch (error) {
            console.error("Грешка при почистване на стари данни за посещения:", error);
        }
    };

    const fetchPageViewsDetails = async () => {
        setLoading(true);
        try {
            const pageViewsRef = ref(rtdb, "page_views");
            const snapshot = await get(pageViewsRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const details = [];
                
                // Get last 7 days
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = moment().subtract(i, 'days');
                    last7Days.push(date.format('YYYY-MM-DD'));
                }

                // Process each date
                Object.keys(data).forEach(dateStr => {
                    // Only include last 7 days
                    if (!last7Days.includes(dateStr)) return;
                    
                    const dateData = data[dateStr];
                    
                    Object.keys(dateData).forEach(pagePath => {
                        const views = dateData[pagePath] || 0;
                        if (views > 0) {
                            details.push({
                                date: dateStr,
                                dateFormatted: moment(dateStr).format('DD.MM.YYYY'),
                                page: pagePath === '/' ? 'Начална страница' : pagePath,
                                pagePath: pagePath,
                                views: views
                            });
                        }
                    });
                });

                // Sort by date (newest first) and then by views (descending)
                details.sort((a, b) => {
                    if (a.date !== b.date) {
                        return b.date.localeCompare(a.date);
                    }
                    return b.views - a.views;
                });

                setPageViewsDetails(details);
            } else {
                setPageViewsDetails([]);
            }
        } catch (error) {
            console.error("Грешка при зареждане на посещения на страници:", error);
            setPageViewsDetails([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPageViewsChartData = async () => {
        try {
            const pageViewsRef = ref(rtdb, "page_views");
            const snapshot = await get(pageViewsRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Get last 7 days
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = moment().subtract(i, 'days');
                    const dateStr = date.format('YYYY-MM-DD');
                    last7Days.push({
                        date: date.format('DD.MM'),
                        fullDate: dateStr,
                        count: 0
                    });
                }

                // Aggregate page views by date
                Object.keys(data).forEach(dateStr => {
                    const dateData = data[dateStr];
                    let dayTotal = 0;
                    
                    Object.keys(dateData).forEach(pagePath => {
                        const views = dateData[pagePath] || 0;
                        dayTotal += views;
                    });
                    
                    // Find the day in last7Days and update count
                    const dayIndex = last7Days.findIndex(day => day.fullDate === dateStr);
                    if (dayIndex !== -1) {
                        last7Days[dayIndex].count = dayTotal;
                    }
                });

                setPageViewsData(last7Days);
            } else {
                setPageViewsData([]);
            }
        } catch (error) {
            console.error("Грешка при зареждане на данни за графика:", error);
            setPageViewsData([]);
        }
    };

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
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <div className="container section-title" data-aos="fade-up">
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
            <div className="container" data-aos="fade-up" data-aos-delay="100" style={{ maxWidth: '1400px' }}>
                <div className="container section-title" data-aos="fade-up">
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
                        Посещения на страници - Последна седмица
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pageViewsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar 
                                dataKey="count" 
                                fill="#fa8c16" 
                                name="Брой посещения"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Page Views by Day Table */}
                <div style={{ 
                    background: '#fff', 
                    padding: '24px', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                        Посещения по дни - Последна седмица
                    </h3>
                    <div style={{ 
                        overflowX: 'auto',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px'
                    }}>
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
                                        fontWeight: '600'
                                    }}>Дата</th>
                                    <th style={{ 
                                        padding: '12px',
                                        textAlign: 'right',
                                        fontWeight: '600'
                                    }}>Брой посещения</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageViewsData.length > 0 ? (
                                    pageViewsData.map((item, index) => (
                                        <tr 
                                            key={index}
                                            style={{ 
                                                borderBottom: '1px solid #f0f0f0'
                                            }}
                                        >
                                            <td style={{ padding: '12px' }}>
                                                {item.date}
                                            </td>
                                            <td style={{ 
                                                padding: '12px',
                                                textAlign: 'right',
                                                fontWeight: '500',
                                                color: '#fa8c16'
                                            }}>
                                                {item.count.toLocaleString('bg-BG')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td 
                                            colSpan="2" 
                                            style={{ 
                                                padding: '20px',
                                                textAlign: 'center',
                                                color: '#999'
                                            }}
                                        >
                                            Няма данни за последната седмица
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
                        Детайлни посещения по страници - Последна седмица
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
                                : 'Няма данни за последната седмица'}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PageViewsPage;
