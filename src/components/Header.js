'use client';

import { useCategories } from '@/context/CategoriesContext';
import { useUser } from '@/context/UserContext';
import { CaretDownOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { logoutUser } from '../../lib/auth';
import CartIcon from './CartIcon';

const Header = () => {
  const auth = getAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deepDropdownOpen, setDeepDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(3);
  const { categories } = useCategories();
  const { user, setUser, isAdmin } = useUser();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const items = [
    {
      key: 'profile',
      label: 'Профил',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'cart',
      label: 'Количка',
      onClick: () => router.push('/order'),
    },
    isAdmin ? {
      key: 'admin',
      label: 'Административен панел',
      onClick: () => router.push('/admin'),
    } : '',
    {
      key: 'logout',
      label: 'Изход',
      onClick: logoutUser,
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleDeepDropdown = () => {
    setDeepDropdownOpen(!deepDropdownOpen);
  };

  const handleMouseEnter = () => {
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setDropdownOpen(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [setUser]);

  return (
    <header id="header" className="header d-flex align-items-center sticky-top">
      <div className="container position-relative d-flex align-items-center justify-content-between">

        {/* Logo */}
        <Link href="/" className="logo d-flex align-items-center me-auto me-xl-0">
          <h1 className="sitename">Централ</h1>
          <span></span>
        </Link>

        {/* Navigation Menu */}
        <nav id="navmenu" className={`navmenu ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            <li>
              <Link href="/" className={pathname === '/' ? 'active' : ''}> Начало </Link>
            </li>
            <li>
              <Link href="/our-menu" className={pathname == '/our-menu' ? 'active' : ''}>Меню</Link>
            </li>
            <li>
              <Link href="/launch-menu" className={pathname == '/launch-menu' ? 'active' : ''}>Обедно меню</Link>
            </li>
            {/* <li
              className="dropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <a
                href="/our-menu"
                onClick={(e) => {
                  e.preventDefault(); 
                  if (typeof window !== "undefined") {
                     window.location.href = "/our-menu"; 
                  }
                }}
                className={pathname == '/our-menu' ? 'active dropdown-toggle' : 'dropdown-toggle'}
              >
                <span>Меню</span>
              </a>
              {dropdownOpen && categories.length && (
                <ul key="cat1">
                  {categories.map((category) => (
                    <div key={category.id}>
                      {category?.children?.length ? (
                        <li className="dropdown" key={category.id}>
                          <a href={`/our-menu/${category.name}`} onClick={toggleDeepDropdown}>
                            <span>{category.name}</span>
                            <i className={`bi bi-chevron-down toggle-dropdown ${deepDropdownOpen ? 'active' : ''}`} />
                          </a>
                          {deepDropdownOpen && (
                            <ul>
                              {category?.children.map((subcategory) => (
                                <li key={subcategory.name+subcategory.id}>
                                  <Link href={`/our-menu/${category.name}/${subcategory.name}`}>{subcategory.name}</Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ) : (
                        <li key={category.id}>
                          <Link href={`/our-menu/${category.name}`}>{category.name}</Link>
                        </li>
                      )}
                    </div>
                  ))}
                </ul>
              )}
            </li> */}
            <li>
              <Link href="/reservation" className={pathname == '/reservation' ? 'active' : ''}>Резервации</Link>
            </li>

            <li>
              <Link href="/for-home" className={pathname == '/for-home' ? 'active' : ''}>Поръчай за вкъщи</Link>
            </li>
            <li
              className="dropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <a
                href="/for-us"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== "undefined") {
                    window.location.href = "/for-us";
                  }
                }}
                className={pathname == '/for-us' ? 'active dropdown-toggle' : 'dropdown-toggle'}
              >
                <span>За нас</span>
              </a>
              <ul key="cat1">
                <li>
                  <Link href="/new-dishes" className={pathname == '/new-dishes' ? 'active' : ''}>Нови предложения</Link>
                </li>
                <li>
                  <Link href="/events" className={pathname == '/events' ? 'active' : ''}>Събития</Link>
                </li>
                <li>
                  <Link href="/gallery" className={pathname == '/gallery' ? 'active' : ''}>Галерия</Link>
                </li>
              </ul>
            </li>
            <li>
              <Link href="/contact" className={pathname == '/contact' ? 'active' : ''}>Контакт</Link>
            </li>
          </ul>
          <i
            className={`mobile-nav-toggle d-xl-none bi ${isMenuOpen ? 'bi-x' : 'bi-list'}`}
            onClick={toggleMenu}
          />
        </nav>
        {user ? (
          <Dropdown menu={{ items }} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()} className="ant-dropdown-link">
              <Space>
                <UserOutlined style={{ fontSize: '18px' }} />
                {user.name}
                <CaretDownOutlined style={{ fontSize: '10px', color: 'black' }} />
              </Space>
            </a>
          </Dropdown>
        ) : (
          <LoginOutlined onClick={() => router.push('/login')} style={{ fontSize: '18px' }} title="Вход" />
        )}

        {user && <CartIcon userId={user.uid} />}

        <Link href="/reservation" className="btn-getstarted">
          Резервирай
        </Link>
      </div>
    </header>
  );
};

export default Header;
