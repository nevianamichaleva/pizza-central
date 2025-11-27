# 📧 Ръководство за настройка на мейл функционалност

## 🚀 Бърза настройка

### 1. Създайте .env.local файл
Създайте файл `.env.local` в основната папка на проекта със следното съдържание:

```bash
# Email Configuration - Заменете с вашите данни

# Gmail SMTP настройки (препоръчително)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
ADMIN_EMAIL=admin@yourrestaurant.com
```

### 2. Настройки за различни провайдери

#### 🔹 Gmail (препоръчително)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Не обикновената парола!
SMTP_FROM=your-email@gmail.com
ADMIN_EMAIL=admin@yourrestaurant.com
```

**За Gmail трябва да:**
1. Отидете в Google Account Settings
2. Включете 2-factor authentication
3. Генерирайте App Password от Security → App passwords
4. Използвайте App Password вместо обикновената парола

#### 🔹 Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@outlook.com
ADMIN_EMAIL=admin@yourrestaurant.com
```

#### 🔹 Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@yahoo.com
ADMIN_EMAIL=admin@yourrestaurant.com
```

#### 🔹 Български провайдери

**Mail.bg:**
```bash
SMTP_HOST=mail.bg
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@mail.bg
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@mail.bg
ADMIN_EMAIL=admin@yourrestaurant.com
```

**Abv.bg:**
```bash
SMTP_HOST=smtp.abv.bg
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@abv.bg
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@abv.bg
ADMIN_EMAIL=admin@yourrestaurant.com
```

### 3. Стартиране на приложението

```bash
# Инсталиране на зависимости (ако не са инсталирани)
npm install

# Стартиране в development режим
npm run dev

# Или стартиране в production режим
npm run build
npm start
```

### 4. Тестване на мейл конфигурацията

1. Отидете в админ панела: `http://localhost:3000/admin`
2. Влезте в "Управление на поръчки"
3. В секцията "SMTP настройки за изпращане на email" натиснете "🧪 Тествай мейл конфигурацията"
4. Ако всичко е настроено правилно, ще получите тестов мейл

### 5. Алтернативен начин за тестване

Можете да тествате мейл функционалността директно чрез API:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-test-email@example.com"}'
```

## 🔧 Настройки в админ панела

Освен environment variables, можете да настроите SMTP конфигурацията директно от админ панела:

1. Влезте в админ панела като администратор
2. Отидете в "Управление на поръчки"
3. Намерете секцията "SMTP настройки за изпращане на email"
4. Натиснете "Редактирай" и въведете вашите SMTP данни
5. Натиснете "Запази"

## 🚨 Важни забележки

1. **Сигурност**: Никога не споделяйте .env.local файла публично
2. **App Passwords**: За Gmail и Yahoo използвайте App Password, не обикновената парола
3. **Firewall**: Уверете се, че портовете 587/465 не са блокирани
4. **SSL/TLS**: За порт 465 използвайте SMTP_SECURE=true, за 587 използвайте false

## 📝 Какво се случва при получаване на поръчка

Когато клиент направи поръчка, системата автоматично:
1. Запазва поръчката в базата данни
2. Изпраща мейл известие на администратора
3. Мейлът съдържа всички детайли на поръчката

## 🔍 Отстраняване на проблеми

### Мейлът не се изпраща
1. Проверете дали .env.local файлът е в правилната папка
2. Проверете дали всички SMTP данни са правилни
3. Използвайте тестовата функция за диагностика
4. Проверете конзолата за грешки

### Gmail не работи
1. Включете 2-factor authentication
2. Генерирайте App Password
3. Използвайте App Password вместо обикновената парола

### Други провайдери
1. Проверете SMTP настройките на вашия провайдер
2. Уверете се, че SMTP е разрешен за вашия акаунт
3. Проверете дали не използвате 2FA без App Password

## 📞 Поддръжка

Ако имате проблеми с настройката, проверете:
1. Логовете в конзолата на браузъра
2. Логовете на сървъра (terminal където стартирате npm run dev)
3. Използвайте тестовата функция за диагностика

