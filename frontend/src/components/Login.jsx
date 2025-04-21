import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.scss";

const AUTH_MODES = {
  LOGIN: {
    title: "Вход",
    submitText: "Войти",
    toggleText: "Нет аккаунта? Зарегистрироваться",
    errorMessage: "Ошибка входа",
  },
  REGISTER: {
    title: "Регистрация",
    submitText: "Зарегистрироваться",
    toggleText: "Уже есть аккаунт? Войти",
    errorMessage: "Ошибка регистрации",
  },
};

function Login({ setToken }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentMode = isLogin ? AUTH_MODES.LOGIN : AUTH_MODES.REGISTER;

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Auth failed");
        }

        const data = await response.json();
        setToken(data.token);
        navigate("/");
      } catch (err) {
        setError(err.message || currentMode.errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [isLogin, credentials, setToken, navigate, currentMode.errorMessage]
  );

  const toggleAuthMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setError("");
  }, []);

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{currentMode.title}</h2>

        {error && (
          <div className="error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9]+"
              title="Только буквы и цифры (3-20 символов)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={handleChange}
              required
              minLength={6}
              maxLength={30}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            aria-label={currentMode.submitText}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {currentMode.submitText}...
              </>
            ) : (
              currentMode.submitText
            )}
          </button>
        </form>

        <div className="toggle-form">
          <button
            onClick={toggleAuthMode}
            type="button"
            aria-label={currentMode.toggleText}
          >
            {currentMode.toggleText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
