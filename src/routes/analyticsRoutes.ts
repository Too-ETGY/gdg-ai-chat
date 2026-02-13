import { Elysia } from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, jwtPlugin } from '../middleware/authMiddleware';
import { AnalyticsResponseSchema } from '../schemas';

export const analyticsRoutes = new Elysia({ prefix: '/analytics' })
  .use(jwtPlugin)
  .derive(authMiddleware)

  .get('/', async (ctx) => {
    const { user } = ctx;
    if (!user || user.role !== 'LEAD_AGENT')
      throw new Error('Forbidden: Only lead agents can access analytics');

    const now = new Date();

    // ─────────────────────────────────────────────
    // 1. Last 7 days — complaints created vs resolved per day
    // ─────────────────────────────────────────────

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6); // inclusive of today = 7 days
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Build label array: ['2026-02-08', ..., '2026-02-14']
    const dayLabels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      dayLabels.push(d.toISOString().slice(0, 10));
    }

    const [createdRaw, resolvedRaw] = await Promise.all([
      // All complaints created in the last 7 days
      prisma.complaint.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true }
      }),
      // All complaints resolved in the last 7 days
      // resolvedAt = system/auto-resolve, resolvedByUserAt = user-resolved
      prisma.complaint.findMany({
        where: {
          status: 'RESOLVED',
          OR: [
            { resolvedAt: { gte: sevenDaysAgo } },
            { resolvedByUserAt: { gte: sevenDaysAgo } }
          ]
        },
        select: { resolvedAt: true, resolvedByUserAt: true }
      })
    ]);

    // Count created per day
    const createdByDay: Record<string, number> = Object.fromEntries(dayLabels.map(d => [d, 0]));
    for (const c of createdRaw) {
      const day = c.createdAt.toISOString().slice(0, 10);
      if (day in createdByDay) createdByDay[day]++;
    }

    // Count resolved per day (use whichever resolvedAt field is set)
    const resolvedByDay: Record<string, number> = Object.fromEntries(dayLabels.map(d => [d, 0]));
    for (const c of resolvedRaw) {
      const resolvedDate = c.resolvedAt ?? c.resolvedByUserAt;
      if (!resolvedDate) continue;
      const day = resolvedDate.toISOString().slice(0, 10);
      if (day in resolvedByDay) resolvedByDay[day]++;
    }

    const dailyChart = dayLabels.map(day => ({
      date: day,
      created: createdByDay[day],
      resolved: resolvedByDay[day]
    }));

    // ─────────────────────────────────────────────
    // 2. Today's complaints — total + by status
    // ─────────────────────────────────────────────

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayComplaints = await prisma.complaint.groupBy({
      by: ['status'],
      where: { createdAt: { gte: todayStart } },
      _count: { status: true }
    });

    const todayByStatus = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    let todayTotal = 0;
    for (const row of todayComplaints) {
      todayByStatus[row.status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'] = row._count.status;
      todayTotal += row._count.status;
    }

    const today = { total: todayTotal, ...todayByStatus };

    // ─────────────────────────────────────────────
    // 3. Sentiment totals + percentage breakdown
    // ─────────────────────────────────────────────

    const sentimentRaw = await prisma.complaintResult.groupBy({
      by: ['sentiment'],
      _count: { sentiment: true }
    });

    const sentimentCounts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, UNKNOWN: 0 };
    let sentimentTotal = 0;
    for (const row of sentimentRaw) {
      const key = row.sentiment ?? 'UNKNOWN';
      sentimentCounts[key as keyof typeof sentimentCounts] = row._count.sentiment;
      sentimentTotal += row._count.sentiment;
    }

    const sentimentPercentage = {
      POSITIVE: sentimentTotal > 0 ? Math.round((sentimentCounts.POSITIVE / sentimentTotal) * 100) : 0,
      NEUTRAL:  sentimentTotal > 0 ? Math.round((sentimentCounts.NEUTRAL  / sentimentTotal) * 100) : 0,
      NEGATIVE: sentimentTotal > 0 ? Math.round((sentimentCounts.NEGATIVE / sentimentTotal) * 100) : 0,
    };

    const sentiment = {
      total: sentimentTotal,
      counts: {
        POSITIVE: sentimentCounts.POSITIVE,
        NEUTRAL:  sentimentCounts.NEUTRAL,
        NEGATIVE: sentimentCounts.NEGATIVE,
      },
      percentage: sentimentPercentage
    };

    return { dailyChart, today, sentiment };
  }, {
    detail: { summary: 'Analytics dashboard (LEAD_AGENT only)' },
    response: AnalyticsResponseSchema
  });