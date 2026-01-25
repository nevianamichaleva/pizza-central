'use client'

import { useUser } from '@/context/UserContext';
import { get, ref } from 'firebase/database';
import moment from 'moment';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { rtdb } from '../../../lib/firebase';

const AdministrationPage = () => {
    const { isAdmin } = useUser();
    const pathname = usePathname();
    const [ordersData, setOrdersData] = useState([]);
    const [bookingsData, setBookingsData] = useState([]);
    const [blogViews, setBlogViews] = useState(0);
    const [cateringRequestsCount, setCateringRequestsCount] = useState(0);
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
                fetchBlogViewsData(),
                fetchCateringRequestsData()
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
                    let orderDate = null;
                    
                    // Clean the date string - remove Bulgarian suffixes like "г." and "ч."
                    let cleanedDate = order.order_date.toString().trim();
                    cleanedDate = cleanedDate.replace(/ г\./g, '').replace(/ ч\./g, '').trim();
                    
                    // Extract date part (before comma if exists)
                    let datePart = cleanedDate;
                    if (cleanedDate.includes(',')) {
                        datePart = cleanedDate.split(',')[0].trim();
                    }
                    
                    // First try: Parse Bulgarian format with dots "D.M.YYYY" or "DD.MM.YYYY"
                    if (datePart.includes('.')) {
                        orderDate = moment(datePart, ['D.M.YYYY', 'DD.MM.YYYY', 'D.M.YY', 'DD.MM.YY'], true);
                    }
                    
                    // Second try: Parse format with slashes "DD/MM/YYYY" or "D/M/YYYY"
                    if ((!orderDate || !orderDate.isValid()) && datePart.includes('/')) {
                        // Try DD/MM/YYYY format (European)
                        orderDate = moment(datePart, ['DD/MM/YYYY', 'D/M/YYYY', 'DD/MM/YY', 'D/M/YY'], true);
                    }
                    
                    // Third try: Parse as Date object (works with ISO strings and toLocaleString)
                    if (!orderDate || !orderDate.isValid()) {
                        try {
                            const dateObj = new Date(order.order_date);
                            if (!isNaN(dateObj.getTime())) {
                                orderDate = moment(dateObj);
                            }
                        } catch (e) {
                            // Ignore
                        }
                    }
                    
                    // Fourth try: Parse with moment using common formats (without strict mode first)
                    if (!orderDate || !orderDate.isValid()) {
                        orderDate = moment(datePart, [
                            'DD.MM.YYYY', 
                            'DD-MM-YYYY', 
                            'YYYY-MM-DD', 
                            'MM/DD/YYYY', 
                            'DD/MM/YYYY',
                            'D.M.YYYY',
                            'D/M/YYYY'
                        ], false); // false = lenient parsing
                    }
                    
                    // Fifth try: Parse full string with time
                    if (!orderDate || !orderDate.isValid()) {
                        orderDate = moment(cleanedDate, [
                            'DD.MM.YYYY HH:mm:ss', 
                            'DD-MM-YYYY HH:mm:ss',
                            'DD/MM/YYYY HH:mm:ss',
                            'DD.MM.YYYY HH:mm',
                            'D.M.YYYY HH:mm',
                            'DD/MM/YYYY HH:mm',
                            'D/M/YYYY HH:mm'
                        ], true);
                    }
                    
                    if (!orderDate || !orderDate.isValid()) {
                        return;
                    }
                    
                    // Check if order date is within last 7 days
                    const daysDiff = moment().diff(orderDate, 'days');
                    if (daysDiff < 0 || daysDiff > 6) {
                        // Order is not in the last 7 days
                        return;
                    }
                    
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

    const fetchCateringRequestsData = async () => {
        try {
            const cateringRef = ref(rtdb, "catering");
            const snapshot = await get(cateringRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const requestsArray = Object.values(data);
                
                // Get last 7 days
                const sevenDaysAgo = moment().subtract(7, 'days').startOf('day');
                let count = 0;

                requestsArray.forEach(request => {
                    let requestDate = null;
                    
                    // Try to parse createdAt first (ISO format)
                    if (request.createdAt) {
                        requestDate = moment(request.createdAt);
                    }
                    // If createdAt is not valid, try to parse date field (DD-MM-YYYY)
                    else if (request.date) {
                        const parts = request.date.split('-');
                        if (parts.length === 3) {
                            const day = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1;
                            const year = parseInt(parts[2], 10);
                            requestDate = moment(new Date(year, month, day));
                        }
                    }

                    if (requestDate && requestDate.isValid() && requestDate.isAfter(sevenDaysAgo)) {
                        count++;
                    }
                });

                setCateringRequestsCount(count);
            } else {
                setCateringRequestsCount(0);
            }
        } catch (error) {
            console.error("Грешка при зареждане на кетъринг заявки:", error);
            setCateringRequestsCount(0);
        }
    };

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
                        <nav style={{ display: 'flex', flexDirection: 'column' }}>
                            <Link 
                                href='/admin/products' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/products' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/products' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/products' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/products') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/products') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на продукти
                            </Link>
                            <Link 
                                href='/admin/menu' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/menu' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/menu' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/menu' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/menu') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/menu') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на меню
                            </Link>
                            <Link 
                                href='/admin/launch-menu' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/launch-menu' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/launch-menu' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/launch-menu' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/launch-menu') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/launch-menu') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на обедно меню
                            </Link>
                            <Link 
                                href='/admin/bookings' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/bookings' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/bookings' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/bookings' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/bookings') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/bookings') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на резервации
                            </Link>
                            <Link 
                                href='/admin/catering' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/catering' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/catering' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/catering' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/catering') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/catering') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на кетъринг
                            </Link>
                            <Link 
                                href='/admin/orders' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/orders' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/orders' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/orders' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/orders') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/orders') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на поръчки
                            </Link>
                            <Link 
                                href='/admin/events' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/events' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/events' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/events' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/events') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/events') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на събития
                            </Link>
                            <Link 
                                href='/admin/new-dishes' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/new-dishes' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/new-dishes' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/new-dishes' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/new-dishes') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/new-dishes') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на нови предложения
                            </Link>
                            <Link 
                                href='/admin/contacts' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/contacts' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/contacts' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/contacts' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/contacts') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/contacts') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на контакти
                            </Link>
                            <Link 
                                href='/admin/packaging' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/packaging' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/packaging' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/packaging' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/packaging') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/packaging') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на опаковки
                            </Link>
                            <Link 
                                href='/admin/blog' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/blog' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/blog' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/blog' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/blog') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/blog') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Управление на блог статии
                            </Link>
                            <Link 
                                href='/admin/page-views' 
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: pathname === '/admin/page-views' ? '#ce1212' : '#333',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    borderLeft: `3px solid ${pathname === '/admin/page-views' ? '#ce1212' : 'transparent'}`,
                                    backgroundColor: pathname === '/admin/page-views' ? '#f5f5f5' : 'transparent',
                                    transition: 'all 0.3s',
                                    marginBottom: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== '/admin/page-views') {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        e.currentTarget.style.borderLeftColor = '#ce1212';
                                        e.currentTarget.style.color = '#ce1212';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== '/admin/page-views') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                        e.currentTarget.style.color = '#333';
                                    }
                                }}
                            >
                                Виж какво правят потребителите
                            </Link>
                        </nav>
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

                                {/* Blog Views and Catering Requests */}
                                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                                    <div style={{ 
                                        background: '#fff', 
                                        padding: '24px', 
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        flex: '1',
                                        minWidth: '300px'
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
                                    <div style={{ 
                                        background: '#fff', 
                                        padding: '24px', 
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        flex: '1',
                                        minWidth: '300px'
                                    }}>
                                        <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                                            Кетъринг заявки - Последни 7 дни
                                        </h3>
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '40px',
                                            fontSize: '48px',
                                            fontWeight: 'bold',
                                            color: '#ce1212'
                                        }}>
                                            {cateringRequestsCount.toLocaleString('bg-BG')}
                                        </div>
                                        <p style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
                                            Брой кетъринг заявки за последната седмица
                                        </p>
                                    </div>
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
