import {Elysia, t} from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

// import { SentimentTrendsResponseSchema } from '../schemas';
// import { getSentimentTrends } from '../controllers/analyticsController';

// export const analyticsRoutes = new Elysia({ prefix: '/analytics' })
//   .use(authMiddleware)
//   .get('/sentiment', getSentimentTrends, {
//     response: SentimentTrendsResponseSchema
//   });

export const analyticsRoutes = new Elysia({ prefix: '/analytics' })
  .use(authMiddleware)

  .get(
    '/sentiment',
    async (ctx) => {
      const { user } = ctx;

      if (!user || user.role !== 'LEAD_AGENT')
        throw new Error('Forbidden: Only lead agents can access analytics');

      // Aggregate sentiment from ComplaintResult
      const trends = await prisma.complaintResult.groupBy({
        by: ['sentiment'],
        _count: { sentiment: true }
      });

      // Transform to { POSITIVE: 5, NEGATIVE: 2, ... }
      const result: Record<string, number> = {};

      for (const t of trends) {
        result[t.sentiment ?? 'UNKNOWN'] = t._count.sentiment;
      }

      return { trends: result };
    },
    {
      response: t.Object({
        trends: t.Record(t.String(), t.Number())
      })
    }
  );
