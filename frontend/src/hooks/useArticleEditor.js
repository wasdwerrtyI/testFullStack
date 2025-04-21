import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * @typedef {Object} Article
 * @property {string} id - Unique identifier of the article
 * @property {string} title - Article title
 * @property {string} content - HTML content of the article
 * @property {string[]} images - Array of image URLs
 * @property {string[]} files - Array of file URLs
 * @property {string} [publishAt] - Optional publish date in ISO format
 * @property {boolean} [published] - Publication status
 */

/**
 * Custom hook for article editing functionality
 * @param {string} token - Authentication token
 * @returns {Object} Article editor methods and state
 */
export function useArticleEditor(token) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [publishDate, setPublishDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef(null);

  /**
   * Fetches article data from API
   * @returns {Promise<Article|null>} Fetched article or null if error
   */
  const fetchArticle = useCallback(async () => {
    if (!id) return null;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch article");

      const article = await response.json();
      setTitle(article.title);
      setContent(article.content);
      setImages(article.images || []);
      setFiles(article.files || []);

      if (article.publishAt) {
        setPublishDate(new Date(article.publishAt).toISOString().slice(0, 16));
      }

      return article;
    } catch (err) {
      setError("Ошибка загрузки статьи");
      console.error("Fetch article error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  /**
   * Saves article to API
   * @param {boolean} [publish=false] - Whether to publish the article
   * @returns {Promise<string|void>} Article ID for new articles
   */
  const handleSave = useCallback(
    async (publish = false) => {
      try {
        setLoading(true);
        setError("");

        const articleData = {
          title,
          content,
          images,
          files,
          published: publish,
          publishAt: publishDate ? new Date(publishDate).toISOString() : null,
        };

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const url = id ? `/api/news/${id}` : "/api/news";
        const method = id ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(articleData),
        });

        if (!response.ok) throw new Error("Failed to save article");

        const data = await response.json();
        navigate("/");

        if (!id) return data._id;
      } catch (err) {
        setError("Ошибка сохранения статьи");
        console.error("Save article error:", err);
      } finally {
        setLoading(false);
      }
    },
    [id, title, content, images, files, publishDate, token, navigate]
  );

  /**
   * Handles file upload
   * @param {FileList} files - Files to upload
   * @param {"image"|"file"} type - Upload type
   */
  const handleUpload = useCallback(
    async (files, type) => {
      if (!files?.length) return;

      try {
        setError("");
        const formData = new FormData();

        Array.from(files).forEach((file) => {
          formData.append("file", file);
        });

        const response = await fetch("/api/files/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload file");

        const { url } = await response.json();
        const fileName = files[0].name;

        if (type === "image") {
          setImages((prev) => [...prev, url]);
          document.execCommand("insertImage", false, url);
        } else {
          setFiles((prev) => [...prev, url]);
          document.execCommand(
            "insertHTML",
            false,
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${fileName}</a>`
          );
        }
      } catch (err) {
        const errorMsg =
          type === "image"
            ? "Ошибка загрузки изображения"
            : "Ошибка загрузки файла";
        setError(errorMsg);
        console.error("Upload error:", err);
      }
    },
    [token]
  );

  /**
   * Handles image upload event
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input event
   */
  const handleImageUpload = useCallback(
    (e) => handleUpload(e.target.files, "image"),
    [handleUpload]
  );

  /**
   * Handles file upload event
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input event
   */
  const handleFileUpload = useCallback(
    (e) => handleUpload(e.target.files, "file"),
    [handleUpload]
  );

  /**
   * Formats editor text
   * @param {string} command - Document.execCommand command
   * @param {string|null} [value] - Optional command value
   */
  const formatText = useCallback((command, value = null) => {
    if (editorRef.current) {
      document.execCommand(command, false, value);
      editorRef.current.focus();
    }
  }, []);

  /**
   * Inserts quote block into editor
   */
  const insertQuote = useCallback(() => {
    if (editorRef.current) {
      document.execCommand(
        "insertHTML",
        false,
        "<blockquote>Цитата</blockquote>"
      );
      editorRef.current.focus();
    }
  }, []);

  /**
   * Inserts code block into editor
   */
  const insertCode = useCallback(() => {
    if (editorRef.current) {
      document.execCommand(
        "insertHTML",
        false,
        "<pre><code>// Ваш код здесь</code></pre>"
      );
      editorRef.current.focus();
    }
  }, []);

  /**
   * Handles editor content change
   */
  const handleContentChange = useCallback(() => {
    editorRef.current && setContent(editorRef.current.innerHTML);
  }, []);

  /**
   * Handles article preview
   */
  const handlePreview = useCallback(async () => {
    if (id) {
      navigate(`/preview/${id}`);
    } else {
      const newId = await handleSave();
      newId && navigate(`/preview/${newId}`);
    }
  }, [id, handleSave, navigate]);

  // Initialize editor with article content
  useEffect(() => {
    if (id) {
      fetchArticle().then((article) => {
        if (article?.content && editorRef.current) {
          editorRef.current.innerHTML = article.content;
        }
      });
    }
  }, [id, fetchArticle]);

  return {
    id,
    title,
    setTitle,
    content,
    setContent,
    images,
    setImages,
    files,
    setFiles,
    publishDate,
    setPublishDate,
    loading,
    error,
    editorRef,
    fetchArticle,
    handleSave,
    handleImageUpload,
    handleFileUpload,
    formatText,
    insertQuote,
    insertCode,
    handleContentChange,
    handlePreview,
  };
}
