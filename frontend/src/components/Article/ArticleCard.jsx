import { Link } from "react-router-dom";

export function ArticleCard({ article, onDelete }) {
  const statusClass = article.published ? "published" : "draft";
  const statusText = article.published ? "Опубликовано" : "Черновик";
  const date = new Date(article.updatedAt).toLocaleDateString();

  return (
    <div className="article-card">
      <h3>{article.title}</h3>
      <div className="article-meta">
        <span className={`status ${statusClass}`}>{statusText}</span>
        <span className="date">{date}</span>
      </div>
      <div className="article-actions">
        <Link to={`/editor/${article._id}`} className="edit-btn">
          Редактировать
        </Link>
        <Link to={`/preview/${article._id}`} className="preview-btn">
          Просмотр
        </Link>
        <button
          onClick={() => onDelete(article._id)}
          className="delete-btn"
          aria-label="Удалить статью"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
