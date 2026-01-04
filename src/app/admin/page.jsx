'use client'

import { useUser } from '@/context/UserContext';
import { get, ref } from 'firebase/database';
import moment from 'moment';
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { rtdb } from '../../../lib/firebase';

const AdministrationPage = () => {
    const { isAdmin } = useUser();
    const [ordersData, setOrdersData] = useState([]);
    const [bookingsData, setBookingsData] = useState([]);
    const [blogViews, setBlogViews] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAdmin) {
            fetchDashboardData();
        }
    }, [isAdmin]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchOrdersData(),
                fetchBookingsData(),
                fetchBlogViewsData()
            ]);
        } catch (error) {
            console.error("Грешка при зареждане на данни:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrdersData = async () => {
        try {
            const ordersRef = ref(rtdb, "orders");
            const snapshot = await get(ordersRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const ordersArray = Object.entries(data)
                    .map(([key, value]) => ({
                        id: key,
                        ...value,
                    }))
                    .filter(order => order.order_date); // Filter orders with dates

                // Get last 7 days
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = moment().subtract(i, 'days');
                    last7Days.push({
                        date: date.format('DD.MM'),
                        fullDate: date.format('YYYY-MM-DD'),
                        count: 0
                    });
                }

                // Count orders per day
                ordersArray.forEach(order => {
                    if (!order.order_date) return;
                    
                    // Try to parse the date - handle different formats
                    const orderDate = moment(order.order_date);
                    if (!orderDate.isValid()) return;
                    
                    const dayIndex = last7Days.findIndex(day => 
                        moment(day.fullDate).isSame(orderDate, 'day')
                    );
                    
                    if (dayIndex !== -1) {
                        last7Days[dayIndex].count++;
                    }
                });

                setOrdersData(last7Days);
            } else {
                setOrdersData([]);
            }
        } catch (error) {
            console.error("Грешка при зареждане на поръчки:", error);
            setOrdersData([]);
        }
    };

    const fetchBookingsData = async () => {
        try {
            const bookingRef = ref(rtdb, "booking");
            const snapshot = await get(bookingRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const bookingsArray = Object.entries(data)
                    .map(([key, value]) => ({
                        id: key,
                        ...value,
                    }))
                    .filter(booking => booking.date); // Filter bookings with dates

                // Get last 7 days
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = moment().subtract(i, 'days');
                    last7Days.push({
                        date: date.format('DD.MM'),
                        fullDate: date.format('DD-MM-YYYY'),
                        count: 0
                    });
                }

                // Count bookings per day (bookings use DD-MM-YYYY format)
                bookingsArray.forEach(booking => {
                    const dayIndex = last7Days.findIndex(day => 
                        day.fullDate === booking.date
                    );
                    
                    if (dayIndex !== -1) {
                        last7Days[dayIndex].count++;
                    }
                });

                setBookingsData(last7Days);
            } else {
                setBookingsData([]);
            }
        } catch (error) {
            console.error("Грешка при зареждане на резервации:", error);
            setBookingsData([]);
        }
    };

    const fetchBlogViewsData = async () => {
        try {
            const postsRef = ref(rtdb, "blog_posts");
            const snapshot = await get(postsRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                let totalViews = 0;
                
                Object.values(data).forEach(post => {
                    totalViews += post.views || 0;
                });

                setBlogViews(totalViews);
            } else {
                setBlogViews(0);
            }
        } catch (error) {
            console.error("Грешка при зареждане на прегледи на блог:", error);
            setBlogViews(0);
        }
    };

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
                        <span></span> <span className="description-title">Административен панел</span>
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '30px', marginTop: '40px', flexWrap: 'wrap' }}>
                    {/* Side Menu */}
                    <div style={{ 
                        width: '100%',
                        maxWidth: '300px',
                        background: '#fff',
                        padding: '24px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '20px'
                    }}>
                        <h3 style={{ 
                            marginBottom: '20px', 
                            fontSize: '18px', 
                            fontWeight: '600',
                            borderBottom: '2px solid #f0f0f0',
                            paddingBottom: '12px'
                        }}>
                            Управление
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Link 
                                href='/admin/products' 
                                className="btn btn-primary w-100 text-center py-2 px-3"
                                style={{ textDecoration: 'none', display: 'block' }}
                            >
                                Управление на продукти
                            </Link>
                            <Link 
                                href='/admin/menu' 
                                className="btn btn-primary w-100 text-center py-2 px-3"
                                style={{ textDecoration: 'none', display: 'block' }}
                            >
                                Управление на меню
                            </Link>
                            <Link 
                                href='/admin/launch-menu' 
                                className="btn btn-primary w-100 text-center py-2 px-3"
                                style={{ textDecoration: 'none', display: 'block' }}
                            >
                                Управление на обедно меню
                            </Link>
                            <Link 
                                href='/admin/bookings' 
                                className="btn btn-primary w-100 text-center py-2 px-3"
                                style={{ textDecoration: 'none', display: 'block' }}
                            >
                                Управление на резервации
                            </Link>
                            <Link 
                                href='/admin/orders' 
                                className="btn btn-primary w-100 text-center py-2 px-3"
                                style={{ textDecoration: 'none', display: 'block' }}
                            >
                                Управление на поръчки
                            </Link>
                            <Link 
                                href='/admin/events' 
                                className="btn btn-primary w-100 text-center py-2 px-3"
                                style={{ textDecoration: 'none', display: 'block' }}
                            >
                                Управление на събития
                            </Link>
                            <Link 
                                href='/admin/new-dishes' 
                                className="btn btn-primary w-100 text-center py-2 px-3"
                                style={{ textDecoration: 'none', display: 'block' }}
                            >
                                Управление на нови предложения
                            </Link>
                            <Link 
                                href='/admin/contacts' 
                                className="btn btn-primary w-100 text-center py-2 px-3"
                                style={{ textDecoration: 'none', display: 'block' }}
                            >
                                Управление на контакти
                            </Link>
                            <Link 
                                href='/admin/packaging' 
                                className="btn btn-primary w-100 text-center py-2 px-3"
                                style={{ textDecoration: 'none', display: 'block' }}
                            >
                                Управление на опаковки
                            </Link>
                            <Link 
                                href='/admin/blog' 
                                className="btn btn-primary w-100 text-center py-2 px-3"
                                style={{ textDecoration: 'none', display: 'block' }}
                            >
                                Управление на блог статии
                            </Link>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <p>Зареждане на данни...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                {/* Orders Chart */}
                                <div style={{ 
                                    background: '#fff', 
                                    padding: '24px', 
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                                        Поръчки - Последна седмица
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={ordersData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Line 
                                                type="monotone" 
                                                dataKey="count" 
                                                stroke="#1890ff" 
                                                strokeWidth={2}
                                                name="Брой поръчки"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Bookings Chart */}
                                <div style={{ 
                                    background: '#fff', 
                                    padding: '24px', 
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                                        Резервации - Последна седмица
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={bookingsData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar 
                                                dataKey="count" 
                                                fill="#52c41a" 
                                                name="Брой резервации"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Blog Views Chart */}
                                <div style={{ 
                                    background: '#fff', 
                                    padding: '24px', 
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                                        Прегледи на блог статии - Общо
                                    </h3>
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '40px',
                                        fontSize: '48px',
                                        fontWeight: 'bold',
                                        color: '#722ed1'
                                    }}>
                                        {blogViews.toLocaleString('bg-BG')}
                                    </div>
                                    <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
                                        Общ брой прегледи на всички публикувани статии
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AdministrationPage;
