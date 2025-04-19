import { useUser } from "@/context/UserContext";
import { get, push, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { rtdb } from '../../lib/firebase';

const Contact = () => {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    message: '',
  });

  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!user?.uid) return;

    const fetchUserProfile = async () => {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    };

    fetchUserProfile();
  }, [user?.uid]);

  async function getUserProfile(userId) {
    const userRef = ref(rtdb, `users/${userId}`);

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        console.log("User Profile:", snapshot.val());
        return snapshot.val();
      } else {
        console.log("No user profile found.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

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
        <h2>Ресторант-пицария Централ гр. Добрич</h2>
        <p>
          <span></span> <span className="description-title">Потребителски профил</span>
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">

        <div className="row gy-4">
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="500">
              <i className="icon bi bi-chat-square-heart flex-shrink-0"></i>
              <div>
                <h3>Име</h3>
                <p>
                  <strong>{userProfile?.name}</strong>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="200">
              <i className="icon bi bi-geo-alt flex-shrink-0"></i>
              <div>
                <h3>Адрес</h3>
                <p>{userProfile?.address}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="300">
              <i className="icon bi bi-telephone flex-shrink-0"></i>
              <div>
                <h3>Телефон</h3>
                <p>{userProfile?.phone}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="400">
              <i className="icon bi bi-envelope flex-shrink-0"></i>
              <div>
                <h3>Email</h3>
                <p>{userProfile?.email}</p>
              </div>
            </div>
          </div>
        </div>
        <section id="contact" className="contact section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Искаш ли да споделиш нещо с нас?</h2>

          </div>
          <form onSubmit={handleSubmit} className="php-email-form" data-aos="fade-up" data-aos-delay="600">
            <div className="row gy-4">
              <div className="col-md-6">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Вашето име"
                  value={userProfile?.name}
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
                  value={user?.email}
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
                  value={userProfile?.phone}
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
        </section>
      </div>
    </section>
  );
};

export default Contact;
