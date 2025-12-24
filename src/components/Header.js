'use client';

import { useUser } from '@/context/UserContext';
import { CaretDownOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from 'firebase/database';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { logoutUser } from '../../lib/auth';
import { rtdb } from '../../lib/firebase';
import CartIcon from './CartIcon';

const Header = () => {
  const auth = getAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deepDropdownOpen, setDeepDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, setUser, isAdmin } = useUser();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasLaunchMenuToday, setHasLaunchMenuToday] = useState(false);

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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // run on mount
    window.addEventListener('resize', handleResize); // update on resize

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    const checkLaunchMenuToday = (data) => {
      if (data) {
        const today = new Date();
        const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        
        // Check if there's a menu for today
        const hasMenu = Object.values(data).some((menu) => menu.date === todayStr);
        setHasLaunchMenuToday(hasMenu);
      } else {
        setHasLaunchMenuToday(false);
      }
    };

    const menuRef = ref(rtdb, "launch-menu");
    
    // Listen to real-time changes
    const unsubscribe = onValue(menuRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          checkLaunchMenuToday(data);
        } else {
          setHasLaunchMenuToday(false);
        }
      } catch (error) {
        console.error("Error checking launch menu:", error);
        setHasLaunchMenuToday(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const MenuLink = ({ href, children, className }) => {
    return (
      <Link
        href={href}
        className={className}
        style={{fontSize: '18px'}}
        onClick={() => setIsMenuOpen(false)} // close menu on click
      >
        {children}
      </Link>
    );
  };

  return (
    <header id="header" className="header d-flex align-items-center sticky-top">
      <div className="container position-relative d-flex align-items-center" style={{
        justifyContent: isMobile ? 'space-between' : 'space-between',
        flexWrap: isMobile ? 'nowrap' : 'nowrap'
      }}>

        {/* Logo */}
        <Link href="/" className="logo d-flex align-items-center me-auto me-xl-0" style={{
          order: isMobile ? 1 : 'unset'
        }}>
          <div style={{ 
            position: 'relative', 
            width: '86px', 
            height: '86px', 
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image
              src="/images/logo.png"
              alt="Централ лого"
              width={58}
              height={58}
              style={{ 
                objectFit: 'contain',
                width: '100%',
                height: '100%'
              }}
              priority
            />
          </div>
          <h1 className="sitename">Централ</h1>
          <span></span>
        </Link>

        {/* Buttons - shown before menu icon on mobile */}
        {isMobile && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-end',
            order: 2
          }}>
            <Link href="/our-menu" className="btn-getstarted">
              Поръчай
            </Link>
            <Link href="/reservation" className="btn-getstarted">
              Резервирай
            </Link>
          </div>
        )}

        {/* Navigation Menu */}
        <nav id="navmenu" className={`navmenu ${isMenuOpen ? 'open' : ''}`} style={{
          order: isMobile ? 3 : 'unset'
        }}>
          <ul>
            <li>
              <MenuLink href="/" className={pathname === '/' ? 'active' : ''}> Начало </MenuLink>
            </li>
            <li>
              <MenuLink href="/our-menu" className={pathname == '/our-menu' ? 'active' : ''}>Меню</MenuLink>
            </li>
            {hasLaunchMenuToday && (
              <li>
                <MenuLink href="/launch-menu" className={pathname == '/launch-menu' ? 'active' : ''}>Обедно меню</MenuLink>
              </li>
            )}
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
              <MenuLink href="/reservation" className={pathname == '/reservation' ? 'active' : ''}>Резервации</MenuLink>
            </li>

            <li>
              <MenuLink href="/for-home" className={pathname == '/for-home' ? 'active' : ''}>Поръчай за вкъщи</MenuLink>
            </li>
            <li
              className="dropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <a
                href="/for-us"
                style={{fontSize: '18px'}}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDeepDropdown();
                  // if (typeof window !== "undefined") {
                  //   window.location.href = "/for-us";
                  // }
                }}
                className={pathname == '/for-us' ? 'active dropdown-toggle' : 'dropdown-toggle'}
              >
                <span>За нас</span>
              </a>
              {deepDropdownOpen && (
                <ul key="cat1">
                  <li>
                    <MenuLink href="/about-us" className={pathname == '/about-us' ? 'active' : ''}>За ресторанта</MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/detski-kut" className={pathname == '/detski-kut' ? 'active' : ''}>Детски кът</MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/new-dishes" className={pathname == '/new-dishes' ? 'active' : ''}>Нови предложения</MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/events" className={pathname == '/events' ? 'active' : ''}>Събития</MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/gallery" className={pathname == '/gallery' ? 'active' : ''}>Галерия</MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/blog" className={pathname == '/blog' ? 'active' : ''}>Любопитно от Централ</MenuLink>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <MenuLink href="/contact" className={pathname == '/contact' ? 'active' : ''}>Контакт</MenuLink>
            </li>
            {isMobile && user && (
              <>
                <li>
                  <MenuLink href="/profile" >Профил</MenuLink>
                </li>
                <li>
                  <MenuLink href="/order" >Количка</MenuLink>
                </li>
                {isAdmin && (
                  <li>
                    <MenuLink href="/admin" >Административен панел</MenuLink>
                  </li>
                )}
                <li onClick={() => { logoutUser(); }}>
                  <MenuLink href="#"  >Изход</MenuLink>
                </li>
              </>
            )}
            {isMobile && !user && (
              <li>
                <MenuLink href="/login">Вход</MenuLink>
              </li>
            )}
          </ul>
          <i
            className={`mobile-nav-toggle d-xl-none bi ${isMenuOpen ? 'bi-x' : 'bi-list'}`}
            onClick={toggleMenu}
          />
        </nav>
        {!isMobile && user ? (
          <Dropdown menu={{ items }} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()} className="ant-dropdown-link">
              <Space>
                <UserOutlined style={{ fontSize: '18px' }} />
                {user.name}
                <CaretDownOutlined style={{ fontSize: '10px', color: 'black' }} />
              </Space>
            </a>
          </Dropdown>
        ) : !isMobile && !user ? (
          <div
            onClick={() => router.push('/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'red', 
              gap: '6px',
            }}
            title="Вход"
          >
            <LoginOutlined style={{ fontSize: '18px' }} />
            <span>Вход</span>
          </div>
        ) : null}

        <div>
          <CartIcon userId={user?.uid} />
        </div>

        {/* Buttons - shown on desktop */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            alignItems: 'flex-end'
          }}>
            <Link href="/our-menu" className="btn-getstarted">
              Поръчай
            </Link>
            <Link href="/reservation" className="btn-getstarted">
              Резервирай
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
