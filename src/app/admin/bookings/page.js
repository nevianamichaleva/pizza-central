'use client';

import { useUser } from '@/context/UserContext';
import { Table } from "antd";
import { get, ref } from 'firebase/database';
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';

const AdminBookingsPage = () => {
    const { isAdmin } = useUser();
    const [bookings, setBookings] = useState([]);
    const columns = [
        {
            title: "Име",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Телефон",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Описание",
            dataIndex: "message",
            key: "message",
        },
        {
            title: "Дата",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Час",
            dataIndex: "time",
            key: "time",
        },
        {
            title: "Брой човека",
            dataIndex: "people",
            key: "people",
        },
        {
            title: "Служебна забележка",
            dataIndex: "our-notice",
            key: "our-notice",
        },
    ];

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const bookingRef = ref(rtdb, "booking");
            const snapshot = await get(bookingRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const array = Object.entries(data)
                    .map(([key, value]) => ({
                        id: key,
                        ...value,
                    }));
                setBookings(array);
            } else {
                message.error("Няма резервации.");
            }
        } catch (error) {
            console.error("Грешка при зареждане на резервации:", error);
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
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <div className="container section-title" data-aos="fade-up">
                    <h2>Административен панел</h2>
                    <p>
                        <span></span> <span className="description-title">Направени резервации</span>
                    </p>
                    <div className="d-flex justify-content-center align-items-center mb-4" style={{ position: "relative" }}>

                    </div>
                    <Table style={{ marginTop: "20px" }} bordered dataSource={bookings} columns={columns} />

                </div>
            </div>
        </section>
    )
}

export default AdminBookingsPage;