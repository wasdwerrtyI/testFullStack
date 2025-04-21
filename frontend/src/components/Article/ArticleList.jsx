import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../../styles/ArticleList.scss";
import { ArticleCard } from "./ArticleCard";

const FILTERS = {
  ALL: "all",
  PUBLISHED: "published",
  DRAFT: "draft",
};
export function ArticleList({ token }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(FILTERS.ALL);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (filter !== FILTERS.ALL) {
        params.published = filter === FILTERS.PUBLISHED;
      }

      const query = new URLSearchParams(params).toString();
      const response = await fetch(`/api/news${query ? `?${query}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch articles");

      const data = await response.json();
      setArticles(data);
    } catch (err) {
      setError("Ошибка загрузки статей");
      console.error("Fetch articles error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, token]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Вы уверены, что хотите удалить эту статью?")) return;

      try {
        const response = await fetch(`/api/news/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to delete article");

        setArticles((prev) => prev.filter((article) => article._id !== id));
      } catch (err) {
        setError("Ошибка удаления статьи");
        console.error("Delete article error:", err);
        fetchArticles();
      }
    },
    [token, fetchArticles]
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Загрузка статей...</span>
      </div>
    );
  }

  return (
    <div className="article-list">
      {error && (
        <div className="error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="list-header">
        <h2>Ваши статьи</h2>

        <div className="filter-controls">
          {Object.entries(FILTERS).map(([key, value]) => (
            <button
              key={value}
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
              aria-label={`Показать ${key.toLowerCase()} статьи`}
            >
              {key === "ALL"
                ? "Все"
                : key === "PUBLISHED"
                ? "Опубликованные"
                : "Черновики"}
            </button>
          ))}
        </div>

        <Link to="/editor" className="new-article-btn">
          + Новая статья
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="no-articles">
          Статей не найдено. Создайте новую статью!
        </div>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
