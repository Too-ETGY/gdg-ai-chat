import {Elysia, t} from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, jwtPlugin, JwtUser } from '../middleware/authMiddleware';
import { 
  ComplaintCreateSchema, 
  ComplaintQuerySchema, 
  ComplaintAssignSchema, 
  ComplaintResponseSchema, 
  ComplaintListResponseSchema, 
  ClassifyResponseSchema, 
  SummarizeResponseSchema, 
  SuggestResponseSchema 
} from '../schemas';

export const complaintRoutes = new Elysia({ prefix: '/complaints' })
  .use(jwtPlugin)
  .derive(authMiddleware)

  .post('/', async (ctx) => {
    const { body, user } = ctx;
    if (!user || user.role !== 'USER') throw new Error('Only users can create complaints');

    // Define priority mapping
    const categoryPriorityMap: Record<string, number> = {
      BUG: 3,
      PAYMENT: 4,
      ACCOUNT: 2,
      HARASSMENT: 5,
      OTHER: 1
    };

    // Default to OTHER if no category provided
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
    // Find the complaint
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { 
        id: true,
        userId: true, 
        status: true,
        resolvedAt: true
      }
    });
    if (!complaint) {
      throw new Error('Complaint not found');
    }
    // Check if user owns this complaint
    if (complaint.userId !== user.id) {
      throw new Error('Forbidden: You can only resolve your own complaints');
    }
    // Check if already resolved
    if (complaint.status === 'RESOLVED') {
      throw new Error('Complaint is already resolved');
    }

    // Get all messages before they're deleted (for AI analysis)
    const messages = await prisma.message.findMany({
      where: { complaintId },
      orderBy: { createdAt: 'asc' },
      select: {
        content: true,
        senderRole: true,
        createdAt: true
      }
    });

    // TODO: Replace with actual AI analysis
    // For now, mock the AI results
    const aiAnalysis = {
      classification: 'User Resolved',
      summary: `Complaint resolved by user. Total messages: ${messages.length}`,
      sentiment: (messages.length > 0 ? 'POSITIVE' : 'NEUTRAL') as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
      suggestedResponse: null
    };

    // Create ComplaintResult to preserve AI analysis
    const result = await prisma.complaintResult.create({
      data: {
        complaintId,
        classification: aiAnalysis.classification,
        summary: aiAnalysis.summary,
        sentiment: aiAnalysis.sentiment ?? 'NEUTRAL',
        suggestedResponse: aiAnalysis.suggestedResponse
      }
    });

    // Update complaint to resolved
    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: 'RESOLVED',
        resolvedAt: null,  // System sets resolvedAt
        resolvedByUserAt: new Date()  // Track when user resolved it themselves
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
        status: 'IN_PROGRESS'  // Update status on assignment
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

    // Gatekeep for agents: Only access if assigned to them
    if (['AGENT', 'LEAD_AGENT'].includes(user.role) && complaint.assignedAgentId !== user.id) {
      throw new Error('Forbidden: Not your assigned complaint');
    }

    return complaint;  // Direct object
  }, {
    detail: { summary: 'Get complaint details (with access checks)' },
    params: t.Object({ id: t.String() }),
    response: ComplaintResponseSchema
  })

  .post('/:id/classify', async (ctx) => {
    const { user } = ctx;
    if (!user || !['AGENT', 'LEAD_AGENT'].includes(user.role)) throw new Error('Forbidden');

    return { classification: 'Bug Report' };  // Mock
  }, {
    detail: { summary: 'Classify complaint (AGENT/LEAD_AGENT only)' },
    params: t.Object({ id: t.String() }),
    response: ClassifyResponseSchema
  })

  .post('/:id/summarize', async (ctx) => {
    const { user } = ctx;
    if (!user || !['AGENT', 'LEAD_AGENT'].includes(user.role)) throw new Error('Forbidden');

    return { summary: 'This is a summary of the complaint.' };  // Mock
  }, {
    detail: { summary: 'Summarize complaint (AGENT/LEAD_AGENT only)' },
    params: t.Object({ id: t.String() }),
    response: SummarizeResponseSchema
  })

  .post('/:id/suggest', async (ctx) => {
    const { user } = ctx;
    if (!user || !['AGENT', 'LEAD_AGENT'].includes(user.role)) throw new Error('Forbidden');

    return { suggestion: 'Suggested response draft.' };  // Mock
  }, {
    detail: { summary: 'Suggest response (AGENT/LEAD_AGENT only)' },
    params: t.Object({ id: t.String() }),
    response: SuggestResponseSchema
  });