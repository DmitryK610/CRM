<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-section">
        <h4>StoneTop</h4>
        <p>Система управления заказами на каменные столешницы</p>
        <p class="copyright">© 2023 Все права защищены</p>
      </div>

      <div class="footer-section">
        <h4>Контакты</h4>
        <ul class="contact-list">
          <li>
            <PhoneIcon class="contact-icon" />
            <a href="tel:+79991234567">+7 (999) 123-45-67</a>
          </li>
          <li>
            <EmailIcon class="contact-icon" />
            <a href="mailto:info@stonetop.ru">info@stonetop.ru</a>
          </li>
          <li>
            <AddressIcon class="contact-icon" />
            <span>г. Москва, ул. Каменная, д. 10</span>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Навигация</h4>
        <ul class="nav-list">
          <li><RouterLink to="/">Главная</RouterLink></li>
          <li><RouterLink to="/orders">Заказы</RouterLink></li>
          <li><RouterLink to="/clients">Клиенты</RouterLink></li>
          <li><RouterLink to="/materials">Материалы</RouterLink></li>
          <li><RouterLink to="/profile">Профиль</RouterLink></li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import PhoneIcon from '@/components/icons/PhoneIcon.vue'
import EmailIcon from '@/components/icons/EmailIcon.vue'
import AddressIcon from '@/components/icons/AddressIcon.vue'
</script>

<style scoped>
.app-footer {
  background-color: #2c3e50;
  color: white;
  padding: 40px 0;
  margin-top: 40px;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

p {
  margin: 0;
  color: #ecf0f1;
  font-size: 0.9rem;
  line-height: 1.5;
}

.copyright {
  margin-top: 16px;
  color: #bdc3c7;
  font-size: 0.8rem;
}

.contact-list,
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-list li,
.nav-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-icon {
  width: 16px;
  height: 16px;
  color: #3498db;
}

a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

a:hover {
  color: #3498db;
  text-decoration: underline;
}

.nav-list a {
  display: block;
  padding: 4px 0;
}
</style>
