'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer id="footer" className="footer dark-background">
      <div className="container">
        <div className="row gy-3">
          {/* Address Section */}
          <div className="col-lg-3 col-md-6 d-flex">
            <i className="bi bi-geo-alt icon"></i>
            <div className="address">
              <h4>Адрес</h4>
              <p>ул. Независимост 4</p>
              <p>Добрич</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="col-lg-3 col-md-6 d-flex">
            <i className="bi bi-telephone icon"></i>
            <div>
              <h4>За контакт</h4>
              <p>
                <strong>Телефон:</strong> <span>+359 895 516 401 / +359 893 315 201</span>
                <br />
                <strong>Email:</strong> <span>pizzacentraldobrich@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="col-lg-3 col-md-6 d-flex">
            <i className="bi bi-clock icon"></i>
            <div>
              <h4>Работно време</h4>
              <p>
                <strong>Понеделник до неделя:</strong> <span>10 - 23</span>
                <br />
                <span></span>
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="col-lg-3 col-md-6">
            <h4>Последвайте ни</h4>
            <div className="social-links d-flex">
              <Link 
                href="https://www.facebook.com/CentralDobrich?locale=bg_BG" 
                className="facebook" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Последвайте ни на Facebook"
              >
                <i className="bi bi-facebook"></i>
              </Link>
              {/* <Link href="#" className="instagram">
                <i className="bi bi-instagram"></i>
              </Link> */}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright and Credits */}
      <div className="container copyright text-center mt-4">
        <p>
          © <span>Copyright</span>{' '}
          <strong className="px-1 sitename">Централ</strong>{' '}
          <span>All Rights Reserved</span>
        </p>
        <div className="credits" style={{ marginTop: '15px' }}>
          <Link href="/privacy-policy" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>
            Политика за личните данни
          </Link>
          <Link href="/obshti-usloviya" style={{ color: '#fff', textDecoration: 'none' }}>
            Общи условия
          </Link>
        </div>
        <div className="credits">
          Designed by{' '}
          <a href="https://bootstrapmade.com/" target="_blank" rel="noopener noreferrer">
            BootstrapMade
          </a>{' '}
          Distributed by{' '}
          <a href="https://themewagon.com" target="_blank" rel="noopener noreferrer">
            ThemeWagon
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
