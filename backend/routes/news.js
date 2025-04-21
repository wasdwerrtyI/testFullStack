import express from "express";
import News from "../models/News.js";
import auth from "../middleware/auth.js";
import { schedulePublication } from "../utils/scheduler.js";

/**
 * News API Router
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @returns {express.Router} Configured router
 */
export default function createNewsRouter(io) {
  const router = express.Router();
  router.use(auth);

  const ERROR_MESSAGES = {
    NOT_FOUND: "News article not found",
    FORBIDDEN: "You are not authorized to perform this action",
    CREATE_ERROR: "Error creating news article",
    UPDATE_ERROR: "Error updating news article",
    DELETE_ERROR: "Error deleting news article",
    PUBLISH_ERROR: "Error publishing news article",
  };

  /**
   * Get all news articles with optional published filter
   * @route GET /api/news
   * @param {boolean} [published] - Filter by published status
   * @returns {News[]} List of news articles
   */
  router.get("/", async (req, res) => {
    try {
      const { published } = req.query;
      const filter =
        published !== undefined ? { published: published === "true" } : {};
      const news = await News.find(filter).sort({ createdAt: -1 });
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Error fetching news articles" });
    }
  });

  /**
   * Get single news article by ID
   * @route GET /api/news/:id
   * @param {string} id - News article ID
   * @returns {News} News article
   */
  router.get("/:id", async (req, res) => {
    try {
      const news = await News.findById(req.params.id);
      if (!news)
        return res.status(404).json({ message: ERROR_MESSAGES.NOT_FOUND });
      res.json(news);
    } catch (error) {
      res.status(400).json({ message: ERROR_MESSAGES.NOT_FOUND });
    }
  });

  /**
   * Create new news article
   * @route POST /api/news
   * @param {string} title - Article title
   * @param {string} content - Article content
   * @param {string[]} [images] - Array of image URLs
   * @param {string[]} [files] - Array of file URLs
   * @param {string} [publishAt] - Scheduled publish date (ISO string)
   * @returns {News} Created news article
   */
  router.post("/", async (req, res) => {
    try {
      const { title, content, images = [], files = [], publishAt } = req.body;

      const news = await News.create({
        title,
        content,
        images,
        files,
        author: req.user.id,
        published: !publishAt || new Date(publishAt) <= new Date(),
        publishAt: publishAt || null,
      });

      handleNewsPublication(news, io);
      res.status(201).json(news);
    } catch (error) {
      console.error("Create news error:", error);
      res.status(400).json({ message: ERROR_MESSAGES.CREATE_ERROR });
    }
  });

  /**
   * Update existing news article
   * @route PUT /api/news/:id
   * @param {string} id - News article ID
   * @param {string} [title] - Updated title
   * @param {string} [content] - Updated content
   * @param {string[]} [images] - Updated image URLs
   * @param {string[]} [files] - Updated file URLs
   * @param {string} [publishAt] - Updated publish date
   * @param {boolean} [published] - Published status
   * @returns {News} Updated news article
   */
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, images, files, publishAt, published } = req.body;

      const news = await News.findById(id);
      if (!news)
        return res.status(404).json({ message: ERROR_MESSAGES.NOT_FOUND });
      if (news.author.toString() !== req.user.id) {
        return res.status(403).json({ message: ERROR_MESSAGES.FORBIDDEN });
      }

      Object.assign(news, {
        title: title ?? news.title,
        content: content ?? news.content,
        images: images ?? news.images,
        files: files ?? news.files,
        publishAt: publishAt ?? news.publishAt,
        published: published ?? news.published,
      });

      await news.save();
      handleNewsPublication(news, io);
      res.json(news);
    } catch (error) {
      console.error("Update news error:", error);
      res.status(400).json({ message: ERROR_MESSAGES.UPDATE_ERROR });
    }
  });

  /**
   * Delete news article
   * @route DELETE /api/news/:id
   * @param {string} id - News article ID
   * @returns {object} Success message
   */
  router.delete("/:id", async (req, res) => {
    try {
      const news = await News.findById(req.params.id);
      if (!news)
        return res.status(404).json({ message: ERROR_MESSAGES.NOT_FOUND });
      if (news.author.toString() !== req.user.id) {
        return res.status(403).json({ message: ERROR_MESSAGES.FORBIDDEN });
      }

      await news.deleteOne();
      io.emit("news:deleted", { id: req.params.id });
      res.json({ message: "News article deleted successfully" });
    } catch (error) {
      console.error("Delete news error:", error);
      res.status(400).json({ message: ERROR_MESSAGES.DELETE_ERROR });
    }
  });

  /**
   * Publish news article immediately
   * @route POST /api/news/:id/publish
   * @param {string} id - News article ID
   * @returns {News} Published news article
   */
  router.post("/:id/publish", async (req, res) => {
    try {
      const news = await News.findById(req.params.id);
      if (!news)
        return res.status(404).json({ message: ERROR_MESSAGES.NOT_FOUND });
      if (news.author.toString() !== req.user.id) {
        return res.status(403).json({ message: ERROR_MESSAGES.FORBIDDEN });
      }

      news.published = true;
      news.publishAt = null;
      await news.save();

      io.emit("news:published", news);
      res.json(news);
    } catch (error) {
      console.error("Publish news error:", error);
      res.status(400).json({ message: ERROR_MESSAGES.PUBLISH_ERROR });
    }
  });

  /**
   * Helper function to handle news publication events
   * @param {News} news - News article
   * @param {import('socket.io').Server} io - Socket.IO instance
   */
  function handleNewsPublication(news, io) {
    if (news.publishAt && new Date(news.publishAt) > new Date()) {
      schedulePublication(news, io);
    } else if (news.published) {
      io.emit(
        news.createdAt === news.updatedAt ? "news:created" : "news:updated",
        news
      );
    }
  }

  return router;
}
