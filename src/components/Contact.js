import { push, ref, set } from 'firebase/database';
import { useState } from 'react';
import { rtdb } from '../../lib/firebase';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    message: '',
  });

  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const contactsRef = ref(rtdb, 'contacts');

    const newContactRef = push(contactsRef);
    set(newContactRef, {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      phone: formData.phone
    })
      .then(() => {
        console.log('Съобщението е изпратено успешно');
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', phone: '' });
      })
      .catch((error) => {
        console.error('Грешка при изпращане на съобщение: ', error);
        setStatus('error');
      });
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Контакти</h2>
        <p>
          <span></span> <span className="description-title">Обърнете се към нас</span>
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="mb-5">
          <iframe
            style={{ width: '100%', height: '400px' }}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2890.7961952987803!2d27.824327076575123!3d43.56912965786365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a5169d3036e93b%3A0xc6b1ad1339889328!2z0JTQvtCx0YDQuNGHINCm0LXQvdGC0YrRgCwg0YPQuy4g4oCe0J3QtdC30LDQstC40YHQuNC80L7RgdGC4oCcIDQsIDkzMDAg0JTQvtCx0YDQuNGH!5e0!3m2!1sbg!2sbg!4v1734551388789!5m2!1sbg!2sbg"
            frameBorder="0"
            allowFullScreen
            title="Location"
          />
        </div>

        <div className="row gy-4">
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="200">
              <i className="icon bi bi-geo-alt flex-shrink-0"></i>
              <div>
                <h3>Адрес</h3>
                <p>гр. Добрич ул. Независимост 4</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
              <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="300">
                <i className="icon bi bi-telephone flex-shrink-0"></i>
                <div>
                  <h3>Телефон</h3>
                  <p>+359 895 516 401</p>
                </div>
              </div>
          </div>
          <div className="col-md-6">
              <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="400">
                <i className="icon bi bi-envelope flex-shrink-0"></i>
                <div>
                  <h3>Email</h3>
                  <p>info@central.bg</p>
                </div>
              </div>
          </div>
          <div className="col-md-6">
              <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="500">
                <i className="icon bi bi-clock flex-shrink-0"></i>
                <div>
                  <h3>Работно време</h3>
                  <p>
                    <strong>Понеделник до неделя</strong> 10 - 23
                  </p>
                </div>
              </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="php-email-form" data-aos="fade-up" data-aos-delay="600">
          <div className="row gy-4">
            <div className="col-md-6">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Вашето име"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Вашия email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                name="phone"
                placeholder="Вашия телефон"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                name="subject"
                placeholder="Относно"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-12">
              <textarea
                className="form-control"
                name="message"
                rows="6"
                placeholder="Съобщение"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-12 text-center">
              {status === 'loading' && <div className="loading">Зареждане ...</div>}
              {status === 'error' && <div className="error-message">Има грешка, опитайте отново</div>}
              {status === 'success' && <div className="sent-message">Вашето съобщение беше изпратено. Благодарим Ви</div>}
              <button type="submit">Изпрати</button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
