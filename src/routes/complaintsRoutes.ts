import {Elysia, t} from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, jwtPlugin, JwtUser } from '../middleware/authMiddleware';
import { analyzeResolution } from '../services/aiService';
import { 
  ComplaintCreateSchema, 
  ComplaintQuerySchema, 
  ComplaintAssignSchema, 
  ComplaintResponseSchema, 
  ComplaintListResponseSchema, 
} from '../schemas';

export const complaintRoutes = new Elysia({ prefix: '/complaints' })
  .use(jwtPlugin)
  .derive(authMiddleware)

  .post('/', async (ctx) => {
    const { body, user } = ctx;
    if (!user || user.role !== 'USER') throw new Error('Only users can create complaints');

    const categoryPriorityMap: Record<string, number> = {
      BUG: 3,
      PAYMENT: 4,
      ACCOUNT: 2,
      HARASSMENT: 5,
      OTHER: 1
    };

    const category = body.category || 'OTHER';
    const priority = categoryPriorityMap[category];

    const complaint = await prisma.complaint.create({
      data: {
        userId: user.id,
        category: category,
        priority: priority,
        status: 'OPEN',
        assignedAgentId: null
      }
    });

    return { message: 'Complaint created', complaintId: complaint.id };
  }, {
    detail: { summary: 'Create a new complaint (USER only)' },
    body: ComplaintCreateSchema,
    response: t.Object({ message: t.String(), complaintId: t.Number() })
  })

  .get('/', async (ctx) => {
    const { query, user } = ctx;
    if (!user) throw new Error('Unauthorized');

    let complaints;
    if (user.role === 'USER') {
      complaints = await prisma.complaint.findMany({
        where: { userId: user.id, ...query },
        include: {
          messages: true,
          result: true,
          user: true,
          assignedAgent: true
        }
      });
      if (complaints.length === 0) {
        throw new Error('No complaints found.');
      }
    } else {
      complaints = await prisma.complaint.findMany({
        where: { status: 'OPEN', ...query },
        include: {
          messages: true,
          result: true,
          user: true,
          assignedAgent: true
        }
      });
    }
    return complaints;
  }, {
    detail: { summary: 'Get complaints (inbox for agents: OPEN only; own for users)' },
    query: ComplaintQuerySchema,
    response: ComplaintListResponseSchema
  })

  .patch('/:id/resolve', async ({ params, user }) => {
    if (!user || user.role !== 'USER') {
      throw new Error('Forbidden: Only users can resolve their own complaints');
    }

    const complaintId = parseInt(params.id);

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { 
        id: true,
        userId: true, 
        status: true,
        resolvedAt: true,
        category: true
      }
    });

    if (!complaint) throw new Error('Complaint not found');

    if (complaint.userId !== user.id) {
      throw new Error('Forbidden: You can only resolve your own complaints');
    }

    if (complaint.status === 'RESOLVED') {
      throw new Error('Complaint is already resolved');
    }

    // Fetch all messages for AI analysis before resolving
    const messages = await prisma.message.findMany({
      where: { complaintId },
      orderBy: { createdAt: 'asc' },
      select: {
        content: true,
        senderRole: true,
        createdAt: true
      }
    });

    // Run AI analysis on the full conversation
    const aiAnalysis = await analyzeResolution(
      messages.map(m => ({ senderRole: m.senderRole, content: m.content })),
      complaint.category ?? null,
      'USER'
    );

    // Persist AI analysis in ComplaintResult
    const result = await prisma.complaintResult.create({
      data: {
        complaintId,
        classification: aiAnalysis.classification,
        summary: aiAnalysis.summary,
        sentiment: aiAnalysis.sentiment,
      }
    });

    // Mark complaint as resolved by user
    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: 'RESOLVED',
        resolvedAt: null,
        resolvedByUserAt: new Date()
      }
    });

    return { 
      message: 'Complaint resolved successfully',
      complaint: {
        id: updated.id,
        status: updated.status,
        resolvedAt: updated.resolvedAt,
        resolvedByUserAt: updated.resolvedByUserAt
      },
      result: {
        id: result.id,
        classification: result.classification,
        summary: result.summary,
        sentiment: result.sentiment
      }
    };
  }, {
    detail: { summary: 'User resolves their own complaint' },
    params: t.Object({ id: t.String() })
  })

  .post('/:id/assign', async (ctx) => {
    const { params, user } = ctx;
    if (!user || !['AGENT', 'LEAD_AGENT'].includes(user.role)) throw new Error('Forbidden');

    const complaintId = parseInt(params.id);
    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });

    if (!complaint || complaint.status !== 'OPEN' || complaint.assignedAgentId !== null) {
      throw new Error('Complaint not available for assignment');
    }

    await prisma.complaint.update({
      where: { id: complaintId },
      data: { 
        assignedAgentId: user.id,
        status: 'IN_PROGRESS'
      }
    });

    return { message: 'Complaint assigned to you' };
  }, {
    detail: { summary: 'Assign self to an OPEN complaint (AGENT/LEAD_AGENT only)' },
    params: t.Object({ id: t.String() }),
    body: ComplaintAssignSchema,
    response: t.Object({ message: t.String() })
  })

  .get('/:id', async (ctx) => { 
    const { params, user } = ctx;
    if (!user) throw new Error('Unauthorized');

    const complaintId = parseInt(params.id);
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { messages: true, result: true, user: true, assignedAgent: true }
    });

    if (!complaint) throw new Error('Complaint not found');

    if (user.role === 'USER' && complaint.userId !== user.id) {
      throw new Error('Forbidden: Not your complaint');
    }

    if (['AGENT', 'LEAD_AGENT'].includes(user.role) && complaint.assignedAgentId !== user.id) {
      throw new Error('Forbidden: Not your assigned complaint');
    }

    return complaint;
  }, {
    detail: { summary: 'Get complaint details (with access checks)' },
    params: t.Object({ id: t.String() }),
    response: ComplaintResponseSchema
  });