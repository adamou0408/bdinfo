// Spec: specs/market-development-tool/spec.md — US-MD-001, US-MD-002, US-MD-004
// Task: specs/market-development-tool/tasks.md — Task 11

import cron from "node-cron";
import prisma from "@/lib/prisma";

export class SchedulerService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private jobs: any[] = [];

  // Daily: Update lead list + check expired data
  scheduleDailyLeadUpdate(scrapeCallback: () => Promise<void>) {
    const job = cron.schedule("0 2 * * *", async () => {
      console.log("[Scheduler] Running daily lead update...");
      try {
        await scrapeCallback();
        console.log("[Scheduler] Daily lead update completed.");
      } catch (error) {
        console.error("[Scheduler] Daily lead update failed:", error);
      }
    });
    this.jobs.push(job);
    return job;
  }

  // Daily: Clean expired data (12 months no interaction) — CONFLICT-002
  scheduleDataExpiry() {
    const job = cron.schedule("0 3 * * *", async () => {
      console.log("[Scheduler] Checking expired data...");
      try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const expired = await prisma.lead.updateMany({
          where: {
            lastInteractionAt: { lt: twelveMonthsAgo },
            dataDeletionRequested: false,
            pipelineStage: { notIn: ["closed_won"] },
          },
          data: {
            expiresAt: new Date(),
          },
        });
        console.log(`[Scheduler] Marked ${expired.count} leads as expired.`);

        // Process deletion requests
        const deleted = await prisma.lead.deleteMany({
          where: { dataDeletionRequested: true },
        });
        if (deleted.count > 0) {
          console.log(`[Scheduler] Deleted ${deleted.count} leads per deletion request.`);
        }
      } catch (error) {
        console.error("[Scheduler] Data expiry check failed:", error);
      }
    });
    this.jobs.push(job);
    return job;
  }

  // Publish scheduled content
  scheduleContentPublish() {
    const job = cron.schedule("*/5 * * * *", async () => {
      try {
        const now = new Date();
        const readyToPublish = await prisma.content.findMany({
          where: {
            status: "approved",
            scheduledAt: { lte: now },
          },
        });

        for (const content of readyToPublish) {
          await prisma.content.update({
            where: { id: content.id },
            data: { status: "published", publishedAt: now },
          });
          console.log(`[Scheduler] Published content: ${content.title}`);
          // In production: call social media API here
        }
      } catch (error) {
        console.error("[Scheduler] Content publish failed:", error);
      }
    });
    this.jobs.push(job);
    return job;
  }

  // Weekly: Generate insight report
  scheduleWeeklyInsight(generateCallback: () => Promise<void>) {
    const job = cron.schedule("0 9 * * 1", async () => {
      console.log("[Scheduler] Generating weekly insight report...");
      try {
        await generateCallback();
        console.log("[Scheduler] Weekly insight report completed.");
      } catch (error) {
        console.error("[Scheduler] Weekly insight report failed:", error);
      }
    });
    this.jobs.push(job);
    return job;
  }

  stopAll() {
    this.jobs.forEach((j) => j.stop());
    this.jobs = [];
  }
}

export default new SchedulerService();
