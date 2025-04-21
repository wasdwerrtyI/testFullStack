# FullStack News Portal

Многофункциональное приложение для публикации новостей с поддержкой отложенной публикации, авторизацией пользователей, загрузкой файлов и современным интерфейсом на React.

## Стек технологий

- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, ES6 Modules
- **Frontend:** React, Redux Toolkit, Styled Components, TypeScript (частично)
- **Аутентификация:** JWT
- **Загрузка файлов:** Multer
- **Планировщик задач:** node-schedule

## Возможности

- Регистрация и вход пользователей
- Создание, редактирование и удаление новостей
- Загрузка изображений и файлов к новостям
- **Отложенная публикация** новостей по заданной дате и времени
- Фильтрация новостей по статусу (все/опубликованные/запланированные)
- Уведомления о новых публикациях через Socket.IO
- Современный и адаптивный интерфейс

## Быстрый старт

### 1. Клонирование репозитория

```sh
git clone [https://github.com/wasdwerrtyI/testFullStack.git](https://github.com/wasdwerrtyI/testFullStack.git)
cd testFullStack

### 2. Запуск Backend

cd backend
npm install
# Заполните .env
npm start

### 3. Запуск Frontend

cd ../frontend
npm install
npm start

Фронтенд: http://localhost:3000
Бэкенд API: http://localhost:5000/api
