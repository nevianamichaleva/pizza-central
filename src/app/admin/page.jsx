'use client'

import { useUser } from '@/context/UserContext';
import Link from "next/link";

const AdministrationPage = () => {
    const { isAdmin } = useUser();
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
                    <h2>Ресторант-пицария Централ</h2>
                    <p>
                        <span></span> <span className="description-title">Административен панел</span>
                    </p>
                    <div className="d-flex justify-content-center align-items-center mb-4" style={{ position: "relative", flexDirection: "column", gap: "10px" }}>
                        <Link href='/admin/products' className="btn btn-primary w-auto text-center py-1 px-3">Управление на продукти</Link>
                        <Link href='/admin/menu' className="btn btn-primary w-auto text-center py-1 px-3">Управление на меню</Link>
                        <Link href='/admin/launch-menu' className="btn btn-primary w-auto text-center py-1 px-3">Управление на обедно меню</Link>
                        <Link href='/admin/bookings' className="btn btn-primary w-auto text-center py-1 px-3">Управление на резервации</Link>
                        <Link href='/admin/orders' className="btn btn-primary w-auto text-center py-1 px-3">Управление на поръчки</Link>
                        <Link href='/admin/events' className="btn btn-primary w-auto text-center py-1 px-3">Управление на събития</Link>
                        <Link href='/admin/new-dishes' className="btn btn-primary w-auto text-center py-1 px-3">Управление на нови предложения</Link>
                        <Link href='/admin/contacts' className="btn btn-primary w-auto text-center py-1 px-3">Управление на контакти</Link>
                        <Link href='/admin/packaging' className="btn btn-primary w-auto text-center py-1 px-3">Управление на опаковки</Link>
                        <Link href='/admin/blog' className="btn btn-primary w-auto text-center py-1 px-3">Управление на блог статии</Link>
                        {/* <Link href='/admin/translations' className="btn btn-primary w-auto text-center py-1 px-3">Управление на преводи</Link> */}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AdministrationPage;
