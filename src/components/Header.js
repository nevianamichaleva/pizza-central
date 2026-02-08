'use client';

import { useCategories } from '@/context/CategoriesContext';
import { useUser } from '@/context/UserContext';
import { CaretDownOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from 'firebase/database';
import Lottie from 'lottie-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { logoutUser } from '../../lib/auth';
import { rtdb } from '../../lib/firebase';
import CartIcon from './CartIcon';

const LOTTIE_URL = '/animations/Pizza-delivery-app.json';

const Header = () => {
  const auth = getAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deepDropdownOpen, setDeepDropdownOpen] = useState(false);
  const [forHomeDropdownOpen, setForHomeDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, setUser, isAdmin } = useUser();
  const { categories } = useCategories();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasLaunchMenuToday, setHasLaunchMenuToday] = useState(false);
  const [headerLottieData, setHeaderLottieData] = useState(null);

  useEffect(() => {
    fetch(LOTTIE_URL)
      .then((res) => res.json())
      .then((data) => setHeaderLottieData(data))
      .catch(() => setHeaderLottieData(null));
  }, []);

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

  const toggleForHomeDropdown = () => {
    setForHomeDropdownOpen(!forHomeDropdownOpen);
  };

  const handleMouseEnter = () => {
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setDropdownOpen(false);
  };

  const handleForHomeMouseEnter = () => {
    setForHomeDropdownOpen(true);
  };

  const handleForHomeMouseLeave = () => {
    setForHomeDropdownOpen(false);
  };

  // Get categories for delivery (for-home)
  const deliveryCategories = categories.filter((category) => {
    // Only show categories with slug and forDelivery === true
    if (!category.slug || category.slug.trim() === '') return false;
    const hasDeliveryField = category.forDelivery !== undefined && category.forDelivery !== null;
    const hasRestaurantField = category.forRestaurant !== undefined && category.forRestaurant !== null;
    if (!hasDeliveryField && !hasRestaurantField) {
      return true; // Show if both fields are missing (backward compatibility)
    }
    return category.forDelivery === true;
  }).sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 0;
    const orderB = b.order !== undefined ? b.order : 0;
    return orderA - orderB;
  });

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
          <div className="sitename">Централ</div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {headerLottieData && (
                <div className="header-lottie" style={{ width: 50, height: 50 }} aria-hidden="true">
                  <Lottie animationData={headerLottieData} loop />
                </div>
              )}
              <Link href="/for-home" className="btn-getstarted" aria-label="Поръчай за доставка до дома">
                Доставка
              </Link>
            </div>
            <Link href="/reservation" className="btn-getstarted" aria-label="Резервирай маса">
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
            <li
              className="dropdown"
              onMouseEnter={handleForHomeMouseEnter}
              onMouseLeave={handleForHomeMouseLeave}
            >
              <button
                type="button"
                aria-expanded={forHomeDropdownOpen}
                aria-haspopup="true"
                style={{fontSize: '18px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--nav-color)', width: '100%', textAlign: 'left'}}
                onClick={(e) => {
                  e.preventDefault();
                  toggleForHomeDropdown();
                }}
                className={(pathname == '/for-home' || pathname?.startsWith('/for-home/')) ? 'active dropdown-toggle' : 'dropdown-toggle'}
              >
                <span>Доставка</span>
              </button>
              {forHomeDropdownOpen && deliveryCategories.length > 0 && (
                <ul key="for-home-categories">
                  <li>
                    <MenuLink 
                      href="/for-home" 
                      className={pathname == '/for-home' ? 'active' : ''}
                    >
                      Всички категории
                    </MenuLink>
                  </li>
                  {deliveryCategories.map((category) => (
                    <li key={category.id}>
                      <MenuLink 
                        href={`/for-home/${category.slug}`} 
                        className={pathname == `/for-home/${category.slug}` ? 'active' : ''}
                      >
                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                      </MenuLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <MenuLink href="/reservation" className={pathname == '/reservation' ? 'active' : ''}>Резервации</MenuLink>
            </li>
            <li>
              <MenuLink href="/our-menu" className={pathname == '/our-menu' ? 'active' : ''}>Меню</MenuLink>
            </li>
            <li>
              <MenuLink href={hasLaunchMenuToday ? "/launch-menu" : "/obedno-menu"} className={pathname == '/launch-menu' || pathname == '/obedno-menu' ? 'active' : ''}>Обедно меню</MenuLink>
            </li>
            <li>
              <MenuLink href="/catering" className={pathname == '/catering' ? 'active' : ''}>Кетъринг</MenuLink>
            </li>
            <li
              className="dropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                aria-expanded={deepDropdownOpen}
                aria-haspopup="true"
                style={{fontSize: '18px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--nav-color)', width: '100%', textAlign: 'left'}}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDeepDropdown();
                }}
                className={(pathname == '/about-us' || pathname == '/detski-kut' || pathname == '/faq' || pathname == '/new-dishes' || pathname == '/events' || pathname == '/gallery' || pathname == '/blog') ? 'active dropdown-toggle' : 'dropdown-toggle'}
              >
                <span>За нас</span>
              </button>
              {deepDropdownOpen && (
                <ul key="cat1">
                  <li>
                    <MenuLink href="/about-us" className={pathname == '/about-us' ? 'active' : ''}>За ресторанта</MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/contact" className={pathname == '/contact' ? 'active' : ''}>Контакт</MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/detski-kut" className={pathname == '/detski-kut' ? 'active' : ''}>Детски кът</MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/faq" className={pathname == '/faq' ? 'active' : ''}>Често задавани въпроси</MenuLink>
                  </li>
                  {/* <li>
                    <MenuLink href="/new-dishes" className={pathname == '/new-dishes' ? 'active' : ''}>Нови предложения</MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/events" className={pathname == '/events' ? 'active' : ''}>Събития</MenuLink>
                  </li> */}
                  <li>
                    <MenuLink href="/blog" className={pathname == '/blog' ? 'active' : ''}>Любопитно от Централ</MenuLink>
                  </li>
                  <li>
                    <MenuLink href="/gallery" className={pathname == '/gallery' ? 'active' : ''}>Галерия</MenuLink>
                  </li>
                </ul>
              )}
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
                <li>
                  <button
                    type="button"
                    onClick={() => { logoutUser(); }}
                    style={{fontSize: '18px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--nav-color)', width: '100%', textAlign: 'left'}}
                    className="menu-link-button"
                  >
                    Изход
                  </button>
                </li>
              </>
            )}
            {isMobile && !user && (
              <li>
                <MenuLink href="/login">Вход</MenuLink>
              </li>
            )}
          </ul>
          <button
            type="button"
            className={`mobile-nav-toggle d-xl-none bi ${isMenuOpen ? 'bi-x' : 'bi-list'}`}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Затвори меню" : "Отвори меню"}
            aria-expanded={isMenuOpen}
            aria-controls="navmenu"
          />
        </nav>
        {!isMobile && user ? (
          <Dropdown menu={{ items }} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()} className="ant-dropdown-link">
              <Space>
                <UserOutlined style={{ fontSize: '18px' }} />
                {user.name}
                <CaretDownOutlined style={{ fontSize: '10px', color: 'var(--default-color)' }} />
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
              color: 'var(--accent-color)', 
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
            {headerLottieData && (
              <div className="header-lottie" style={{ width: 50, height: 50 }} aria-hidden="true">
                <Lottie animationData={headerLottieData} loop />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

              <Link href="/for-home" className="btn-getstarted" aria-label="Поръчай от менюто">
                Доставка
              </Link>
            </div>
            <Link href="/reservation" className="btn-getstarted" aria-label="Резервирай маса">
              Резервирай
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
