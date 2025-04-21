import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
const router = express.Router();

const ERROR_MESSAGES = {
  MISSING_FIELDS: "Необходимо указать имя пользователя и пароль",
  USER_EXISTS: "Пользователь с таким именем уже существует",
  INVALID_CREDENTIALS: "Неверные учетные данные",
  REGISTRATION_ERROR: "Ошибка регистрации",
  LOGIN_ERROR: "Ошибка входа",
};

const AUTH_CONFIG = {
  SALT_ROUNDS: 10,
  TOKEN_EXPIRES_IN: "7d",
};

/**
 * Регистрация нового пользователя
 * @route POST /api/auth/register
 * @param {string} username - Имя пользователя
 * @param {string} password - Пароль
 * @returns {object} 201 - Токен авторизации
 * @returns {object} 400 - Отсутствуют обязательные поля
 * @returns {object} 409 - Пользователь уже существует
 * @returns {object} 500 - Ошибка сервера
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: ERROR_MESSAGES.MISSING_FIELDS });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: ERROR_MESSAGES.USER_EXISTS });
    }

    const hashedPassword = await bcrypt.hash(password, AUTH_CONFIG.SALT_ROUNDS);
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: AUTH_CONFIG.TOKEN_EXPIRES_IN,
    });

    return res.status(201).json({ token });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: ERROR_MESSAGES.REGISTRATION_ERROR,
    });
  }
});

/**
 * Аутентификация пользователя
 * @route POST /api/auth/login
 * @param {string} username - Имя пользователя
 * @param {string} password - Пароль
 * @returns {object} 200 - Токен авторизации
 * @returns {object} 401 - Неверные учетные данные
 * @returns {object} 500 - Ошибка сервера
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: AUTH_CONFIG.TOKEN_EXPIRES_IN,
    });

    return res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: ERROR_MESSAGES.LOGIN_ERROR,
    });
  }
});

export default router;
