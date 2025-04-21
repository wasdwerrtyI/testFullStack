import nodeSchedule from "node-schedule";
import News from "../models/News.js";

/**
 * Schedules news publication if publishAt is in the future
 * @param {News} news - News article to schedule
 * @param {import('socket.io').Server} io - Socket.IO server instance
 * @returns {nodeSchedule.Job|null} Scheduled job or null if not scheduled
 */
export function schedulePublication(news, io) {
  // Validate if scheduling is needed
  if (!news.publishAt || news.published) return null;

  const publicationDate = new Date(news.publishAt);
  if (publicationDate <= new Date()) return null;

  // Create job ID from news ID
  const jobId = `news-publish-${news._id.toString()}`;

  // Cancel existing job if any
  const existingJob = nodeSchedule.scheduledJobs[jobId];
  if (existingJob) {
    existingJob.cancel();
  }

  // Schedule new publication job
  return nodeSchedule.scheduleJob(jobId, publicationDate, async () => {
    try {
      const doc = await News.findById(news._id);
      if (!doc || doc.published) return;

      doc.published = true;
      doc.publishAt = null;
      await doc.save();

      io.emit("news:published", doc);
      console.log(`Published scheduled news: ${doc.title}`);
    } catch (error) {
      console.error("Error publishing scheduled news:", error);
    }
  });
}

/**
 * Initializes scheduler for all unpublished scheduled news (on server start)
 * @param {import('socket.io').Server} io - Socket.IO server instance
 * @returns {Promise<number>} Number of scheduled jobs
 */
export async function setupScheduler(io) {
  try {
    const scheduledNews = await News.find({
      published: false,
      publishAt: { $gt: new Date() },
    });

    scheduledNews.forEach((news) => schedulePublication(news, io));
    console.log(`Scheduled ${scheduledNews.length} news publications`);
    return scheduledNews.length;
  } catch (error) {
    console.error("Error initializing news scheduler:", error);
    return 0;
  }
}

export default {
  schedulePublication,
  setupScheduler,
};
