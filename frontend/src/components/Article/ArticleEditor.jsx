import React from "react";
import "../../styles/ArticleEditor.scss";
import { useArticleEditor } from "../../hooks/useArticleEditor";
import { UploadButton } from "./UploadButton";

export function ArticleEditor({ token }) {
  const {
    title,
    setTitle,
    publishDate,
    setPublishDate,
    loading,
    error,
    editorRef,
    handleSave,
    handleImageUpload,
    handleFileUpload,
    formatText,
    insertQuote,
    insertCode,
    handleContentChange,
    handlePreview,
  } = useArticleEditor(token);

  const FORMAT_BUTTONS = [
    { action: () => formatText("bold"), label: "B", title: "Жирный" },
    { action: () => formatText("italic"), label: "I", title: "Курсив" },
    {
      action: () => formatText("underline"),
      label: "U",
      title: "Подчеркнутый",
    },
    {
      action: () => formatText("formatBlock", "<h2>"),
      label: "H2",
      title: "Заголовок",
    },
    {
      action: () => formatText("formatBlock", "<h3>"),
      label: "H3",
      title: "Подзаголовок",
    },
    { action: insertQuote, label: "❝", title: "Цитата" },
    { action: insertCode, label: "</>", title: "Код" },
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Загрузка...</span>
      </div>
    );
  }

  return (
    <div className="article-editor">
      {/* Отображение ошибок */}
      {error && (
        <div className="error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Шапка редактора */}
      <div className="editor-header">
        <input
          type="text"
          placeholder="Заголовок статьи"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
          maxLength={120}
        />

        <div className="publish-options">
          <input
            type="datetime-local"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            placeholder="Дата публикации"
          />
        </div>
      </div>

      {/* Панель инструментов */}
      <div className="toolbar">
        {FORMAT_BUTTONS.map((btn, index) => (
          <button key={index} onClick={btn.action} title={btn.title}>
            {btn.label}
          </button>
        ))}

        <UploadButton
          icon="🖼️"
          accept="image/*"
          onChange={handleImageUpload}
          title="Добавить изображение"
        />

        <UploadButton
          icon="📎"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          title="Добавить файл"
        />
      </div>

      {/* Область редактирования */}
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleContentChange}
        suppressContentEditableWarning
        placeholder="Начните вводить текст статьи..."
      />

      {/* Кнопки действий */}
      <div className="editor-actions">
        <button onClick={() => handleSave(false)} className="save-btn">
          Сохранить черновик
        </button>

        <button onClick={() => handleSave(true)} className="publish-btn">
          Опубликовать
        </button>

        <button onClick={handlePreview} className="preview-btn">
          Предпросмотр
        </button>
      </div>
    </div>
  );
}

export default ArticleEditor;
