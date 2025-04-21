import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/ArticlePreview.scss";
import { ArticleMeta } from "./ArticleMeta";
import { FileList } from "./FileList";

export function ArticlePreview({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchArticle = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch article");

      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError("Ошибка загрузки статьи");
      console.error("Fetch article error:", err);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleEdit = useCallback(() => {
    navigate(`/editor/${id}`);
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Загрузка статьи...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <span className="error-icon">⚠️</span>
        {error}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="error">
        <span className="error-icon">⚠️</span>
        Статья не найдена
      </div>
    );
  }

  return (
    <div className="article-preview">
      <div className="preview-header">
        <h1>{article.title}</h1>

        <div className="preview-meta">
          <ArticleMeta
            published={article.published}
            publishAt={article.publishAt}
          />
        </div>

        <button
          onClick={handleEdit}
          className="edit-btn"
          aria-label="Редактировать статью"
        >
          Редактировать
        </button>
      </div>

      <div
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <FileList files={article.files} />
    </div>
  );
}
