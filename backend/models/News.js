import mongoose from 'mongoose';
/**
 * @typedef News
 * @property {string} title - News title
 * @property {string} content - News content (HTML/Markdown)
 * @property {string} author - Author's user id
 * @property {string[]} images - Array of image URLs
 * @property {string[]} files - Array of file URLs
 * @property {boolean} published - Is published
 * @property {Date} publishAt - Scheduled publish date
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [String],
  files: [String],
  published: { type: Boolean, default: false },
  publishAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('News', newsSchema);
