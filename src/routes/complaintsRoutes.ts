import {Elysia, t} from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';
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
  .use(authMiddleware)
  .post('/', async (ctx) => {
    const { body, user } = ctx;
    if (!user || user.role !== 'USER') throw new Error('Only users can create complaints');

    const complaint = await prisma.complaint.create({
      data: {
        userId: user.id,
        category: body.category,
        priority: body.priority,
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

  .get('/', async (ctx) => {  // Fixed: No { ctx }
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
    query: ComplaintQuerySchema
    // Removed: response (temporarily disable validation)
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
      data: { assignedAgentId: user.id }
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

    return complaint;  // Direct object
  }, {
    detail: { summary: 'Get complaint details (with access checks)' },
    params: t.Object({ id: t.String() }),
    // response: ComplaintResponseSchema
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