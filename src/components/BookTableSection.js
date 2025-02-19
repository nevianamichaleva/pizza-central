import { Button, DatePicker, Form, Input, InputNumber, TimePicker } from "antd";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { push, ref, set } from 'firebase/database';
import moment from 'moment';
import { useEffect } from 'react';
import { rtdb } from '../../lib/firebase';
import showAToast from "./common/showAToast";

const BookTableSection = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  const handleSubmit = (values) => {
    const bookingData = {
      name: values.name || '',
      email: values.email || '',
      message: values.message || '',
      phone: values.phone || '',
      people: values.people || 0,
      date: values.date ? values.date.format('DD-MM-YYYY') : '',
      time: values.time ? values.time.format('HH:mm') : '',
    };

    const bookingRef = ref(rtdb, 'booking');
    const newBookingRef = push(bookingRef);

    set(newBookingRef, bookingData)
      .then(() => {
        setTimeout(() => {
          showAToast('success', 'Вашата резервация е успешна. Очаквайте нашето обаждане за да обсъдим подробностите!');
          form.resetFields();
        }, 1000);

      })
      .catch((error) => {
        showAToast('error', 'Неуспешна резервация, моля опитайте отново или се обадете на телефон +359 895 516 401');
      });
  };

  const disableOldDates = (current) => {
    return current && current.isBefore(moment().startOf('day'), 'day');
  };

  const disableTime = () => {
    return {
      disabledHours: () => {
        return Array.from({ length: 10 }, (_, i) => i);
      },
      disabledMinutes: () => {
        return [];
      },
      disabledSeconds: () => {
        return [];
      },
    };
  };

  return (
    <section id="book-a-table" className="book-a-table section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Запази маса</h2>
        <p>
          <span>Резервирайте</span> <span className="description-title">престоя си при нас</span>
        </p>
      </div>

      <div className="container">
        <div className="row g-0" data-aos="fade-up" data-aos-delay="100">
          {/* Reservation Image */}
          <div
            className="col-lg-4 reservation-img"
            style={{ backgroundImage: 'url(/images/reservation.jpg)' }}
          ></div>

          {/* Reservation Form */}
          <div className="col-lg-8 d-flex align-items-center reservation-form-bg" data-aos="fade-up" data-aos-delay="200" style={{ padding: "25px" }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="reservation-form"
            >
              <div className="row gy-4">
                <div className="col-lg-4 col-md-6">
                  <Form.Item
                    name="name"
                    label="Вашето име"
                    rules={[{ required: true, message: "Моля въведете лице, на чието име е резервацията" }]}
                  >
                    <Input placeholder="Имена" className="form-control" />
                  </Form.Item>
                </div>

                <div className="col-lg-4 col-md-6">
                  <Form.Item
                    name="email"
                    label="Вашия email"
                    rules={[
                      { required: true, message: "Моля въведете email" },
                      { type: "email", message: "Моля, въведете валиден email" },
                    ]}
                  >
                    <Input placeholder="Вашия email" className="form-control" />
                  </Form.Item>
                </div>

                <div className="col-lg-4 col-md-6">
                  <Form.Item
                    name="phone"
                    label="Телефон"
                    rules={[{ required: true, message: "Въведете телефон за връзка" }]}
                  >
                    <Input placeholder="Телефон" className="form-control" />
                  </Form.Item>
                </div>

                <div className="col-lg-4 col-md-6">
                  <Form.Item
                    name="date"
                    label="Дата"
                    rules={[{ required: true, message: "Изберете дата на резервацията" }]}
                  >
                    <DatePicker
                      disabledDate={disableOldDates}
                      style={{ width: "100%" }}
                      placeholder="Изберете дата"
                      format="DD.MM.YYYY"
                    />
                  </Form.Item>
                </div>

                <div className="col-lg-4 col-md-6">
                  <Form.Item
                    name="time"
                    label="Час"
                    rules={[{ required: true, message: "Изберете час за резервацията" }]}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      placeholder="Изберете час"
                      className="form-control"
                      disabledTime={disableTime}
                      format="HH:mm"
                    />
                  </Form.Item>
                </div>

                <div className="col-lg-4 col-md-6">
                  <Form.Item
                    name="people"
                    label="За колко човека?"
                    rules={[{ required: true, message: "Моля, въведере брой на хората" }]}
                  >
                    <InputNumber style={{ width: "100%" }} placeholder="Брой хора" min={1} className="form-control" />
                  </Form.Item>
                </div>
              </div>

              <Form.Item name="message" label="Съобщение">
                <Input.TextArea rows={5} placeholder="Някакви специални изисквания, напишете ги тук" className="form-control" />
              </Form.Item>

              <div className="text-center mt-3">
                <Button type="primary" htmlType="submit">
                  Запази
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookTableSection;
