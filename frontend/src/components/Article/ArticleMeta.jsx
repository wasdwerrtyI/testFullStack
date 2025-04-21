export const ArticleMeta = ({ published, publishAt }) => {
  if (published) {
    return <span className="status published">Опубликовано</span>;
  }
  if (publishAt) {
    return (
      <span className="status scheduled">
        Запланировано на {new Date(publishAt).toLocaleString()}
      </span>
    );
  }
  return <span className="status draft">Черновик</span>;
};
