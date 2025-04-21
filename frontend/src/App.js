import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import {
  ArticleList,
  ArticleEditor,
  ArticlePreview,
} from "./components/Article";

import NotificationBell from "./components/NotificationBell";
import Login from "./components/Login";
import "./styles/App.scss";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      localStorage.setItem("token", token);
    } else {
      setIsLoggedIn(false);
      localStorage.removeItem("token");
    }
  }, [token]);

  const handleLogout = () => {
    setToken("");
  };

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Редактор новостных статей</h1>
          <nav>
            {isLoggedIn ? (
              <>
                <Link to="/">Статьи</Link>
                <Link to="/editor">Новая статья</Link>
                <button onClick={handleLogout}>Выход</button>
                <NotificationBell token={token} />
              </>
            ) : (
              <Link to="/login">Вход</Link>
            )}
          </nav>
        </header>

        <main className="app-content">
          <Routes>
            <Route
              path="/login"
              element={
                isLoggedIn ? <Navigate to="/" /> : <Login setToken={setToken} />
              }
            />
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <ArticleList token={token} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/editor"
              element={
                isLoggedIn ? (
                  <ArticleEditor token={token} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/editor/:id"
              element={
                isLoggedIn ? (
                  <ArticleEditor token={token} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/preview/:id"
              element={
                isLoggedIn ? (
                  <ArticlePreview token={token} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
