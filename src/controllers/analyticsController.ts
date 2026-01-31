// import { prisma } from '../lib/prisma';
// import { AuthContexts } from '../utils/auth-types';

// export const getSentimentTrends = async (ctx: AuthContexts) => {
//   const { user } = ctx;
//   if (user.role !== 'LEAD_AGENT') throw new Error('Forbidden: Only lead agents can access analytics');

//   // Aggregate sentiment from ComplaintResult
//   const trends = await prisma.complaintResult.groupBy({
//     by: ['sentiment'],
//     _count: { sentiment: true }
//   });

//   // Transform to { POSITIVE: 5, NEGATIVE: 2, ... }
//   const result: Record<string, number> = {};
//   trends.forEach(t => {
//     result[t.sentiment || 'UNKNOWN'] = t._count.sentiment;
//   });

//   return { trends: result };
// };
