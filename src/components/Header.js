'use client';

import { useCategories } from '@/context/CategoriesContext';
import { useUser } from '@/context/UserContext';
import { CaretDownOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from 'firebase/database';
// import Lottie from 'lottie-react';
import { hasLaunchMenuForToday } from '@/lib/launchMenuToday';
import { filterDeliveryCategories } from '@/lib/obednoMenuSchedule';
import { useObednoMenuSchedule } from '@/hooks/useObednoMenuSchedule';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { logoutUser } from '../../lib/auth';
import { rtdb } from '../../lib/firebase';
import CartIcon from './CartIcon';

// const LOTTIE_URL = '/animations/Pizza-delivery-app.json';

const Header = () => {
  const auth = getAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deepDropdownOpen, setDeepDropdownOpen] = useState(false);
  const [forHomeDropdownOpen, setForHomeDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, setUser, isAdmin } = useUser();
  const { categories } = useCategories();
  const { isObednoOpen } = useObednoMenuSchedule();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasLaunchMenuToday, setHasLaunchMenuToday] = useState(false);
  // const [headerLottieData, setHeaderLottieData] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [stickyBarCartCount, setStickyBarCartCount] = useState(0);
  const [stickyBarCartId, setStickyBarCartId] = useState(null);

  useEffect(() => {
    const cartId = typeof window !== 'undefined' ? window.localStorage.getItem('cartId') : null;
    setStickyBarCartId(cartId);
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      const cartId = typeof window !== 'undefined' ? window.localStorage.getItem('cartId') : null;
      setStickyBarCartId(cartId);
    };
    window.addEventListener('cart:update', handleCartUpdate);
    return () => window.removeEventListener('cart:update', handleCartUpdate);
  }, []);

  useEffect(() => {
    if (!stickyBarCartId) {
      setStickyBarCartCount(0);
      return;
    }
    const orderRef = ref(rtdb, `orders/${stickyBarCartId}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (!snapshot.exists()) {
        setStickyBarCartCount(0);
        return;
      }
      const order = snapshot.val();
      if (!order || order.status !== 'pending') {
        setStickyBarCartCount(0);
        return;
      }
      const items = order.items || {};
      const count = Object.values(items).reduce((total, item) => {
        if (item.isPackaging) return total;
        const q = Number(item.quantity);
        return total + (Number.isFinite(q) ? q : 0);
      }, 0);
      setStickyBarCartCount(count);
    });
    return () => unsubscribe();
  }, [stickyBarCartId]);

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
  const deliveryCategories = filterDeliveryCategories(
    categories.filter((category) => category.slug && category.slug.trim() !== ''),
    isObednoOpen,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // run on mount
    window.addEventListener('resize', handleResize); // update on resize

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const STICKY_THRESHOLD = 100;
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > STICKY_THRESHOLD);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    const checkLaunchMenuToday = (data) => {
      setHasLaunchMenuToday(hasLaunchMenuForToday(data));
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
    <>
    {/* На мобилни при превъртане – компактна лента отгоре: лого, доставка, резервация, меню */}
    {isMobile && (
      <div
        className={`header-sticky-bar ${showStickyBar ? 'header-sticky-bar-visible' : ''}`}
        aria-hidden="true"
      >
        <div className="header-sticky-bar-inner">
          <Link href="/" className="header-sticky-bar-logo" aria-label="Начало">
            <Image
              src="/images/logo.png"
              alt=""
              width={36}
              height={36}
              style={{ objectFit: 'contain' }}
            />
            <span className="header-sticky-bar-sitename">Централ</span>
          </Link>
          <div className="header-sticky-bar-actions">
            <Link href="/for-home" className="header-sticky-bar-btn header-sticky-bar-icon" aria-label="Доставка" title="Доставка">
              <i className="bi bi-car-front" aria-hidden="true" />
            </Link>
            <Link href="/reservation" className="header-sticky-bar-btn header-sticky-bar-icon" aria-label="Резервация" title="Резервация">
              <svg className="header-sticky-bar-svg-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M13 .5c0-.276-.226-.506-.498-.465-1.703.257-2.94 2.012-3 8.462a.5.5 0 0 0 .498.5c.56.01 1 .13 1 1.003v5.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zM4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z"/>
              </svg>
            </Link>
            {/* <Link href="/catering" className="header-sticky-bar-btn header-sticky-bar-icon" aria-label="Кетъринг" title="Кетъринг">
              <i className="bi bi-cake2" aria-hidden="true" />
            </Link> */}
            <Link href="/order" className="header-sticky-bar-btn header-sticky-bar-icon header-sticky-bar-cart" aria-label={`Количка${stickyBarCartCount > 0 ? ` – ${stickyBarCartCount} продукта` : ''}`} title="Количка">
              <i className="bi bi-cart3" aria-hidden="true" />
              {stickyBarCartCount > 0 && (
                <span className="header-sticky-bar-cart-badge" aria-hidden="true">{stickyBarCartCount > 99 ? '99+' : stickyBarCartCount}</span>
              )}
            </Link>
            <button
              type="button"
              className={`header-sticky-bar-menu bi ${isMenuOpen ? 'bi-x' : 'bi-list'}`}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Затвори меню' : 'Отвори меню'}
              aria-expanded={isMenuOpen}
            />
          </div>
        </div>
      </div>
    )}
    <header id="header" className={`header d-flex align-items-center ${isMobile ? 'header-mobile-no-sticky' : 'sticky-top'}`}>
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
              {/* {headerLottieData && (
                <div className="header-lottie" style={{ width: 50, height: 50 }} aria-hidden="true">
                  <Lottie animationData={headerLottieData} loop />
                </div>
              )} */}
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
                href="/central-menu"
                onClick={(e) => {
                  e.preventDefault(); 
                  if (typeof window !== "undefined") {
                     window.location.href = "/central-menu"; 
                  }
                }}
                className={pathname === '/central-menu' || (typeof pathname === 'string' && /^\/(bg|en|ro|de)\/central-menu$/.test(pathname)) ? 'active dropdown-toggle' : 'dropdown-toggle'}
              >
                <span>Меню</span>
              </a>
              {dropdownOpen && categories.length && (
                <ul key="cat1">
                  {categories.map((category) => (
                    <div key={category.id}>
                      {category?.children?.length ? (
                        <li className="dropdown" key={category.id}>
                          <a href={`/central-menu`} onClick={toggleDeepDropdown}>
                            <span>{category.name}</span>
                            <i className={`bi bi-chevron-down toggle-dropdown ${deepDropdownOpen ? 'active' : ''}`} />
                          </a>
                          {deepDropdownOpen && (
                            <ul>
                              {category?.children.map((subcategory) => (
                                <li key={subcategory.name+subcategory.id}>
                                  <Link href={`/central-menu`}>{subcategory.name}</Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ) : (
                        <li key={category.id}>
                          <Link href={`/central-menu`}>{category.name}</Link>
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
              <MenuLink
                href="/central-menu"
                className={
                  pathname === '/central-menu' ||
                  (typeof pathname === 'string' && /^\/(bg|en|ro|de)\/central-menu$/.test(pathname))
                    ? 'active'
                    : ''
                }
              >
                Меню
              </MenuLink>
            </li>
            <li>
              <MenuLink href={"/obedno-menu"} className={pathname == '/obedno-menu' ? 'active' : ''}>Обедно меню</MenuLink>
            </li>
            <li>
              {/* <MenuLink href="/catering" className={pathname == '/catering' ? 'active' : ''}>Кетъринг</MenuLink> */}
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
            {/* {headerLottieData && (
              <div className="header-lottie" style={{ width: 50, height: 50 }} aria-hidden="true">
                <Lottie animationData={headerLottieData} loop />
              </div>
            )} */}
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
    </>
  );
};

export default Header;
