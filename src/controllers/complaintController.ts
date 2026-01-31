import { prisma } from '../lib/prisma';
import { ComplaintCreateSchema, ComplaintQuerySchema } from '../schemas';

export const createComplaint = async ({ body, user }: { body: typeof ComplaintCreateSchema.static; user: { id: number; role: string } }) => {
  if (user.role !== 'USER') throw new Error('Only users can create complaints');

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
};

export const getComplaints = async ({ query, user }: { query: typeof ComplaintQuerySchema.static; user: { id: number; role: string } }) => {
  if (user.role === 'USER') {
    // Users see only their complaints
    return await prisma.complaint.findMany({
      where: { userId: user.id, ...query },
      include: { messages: true, result: true }
    });
  } else {
    // Agents see all OPEN complaints (inbox)
    return await prisma.complaint.findMany({
      where: { status: 'OPEN', ...query },
      include: { messages: true, result: true }
    });
  }
};

export const assignComplaint = async ({ params, user }: { params: { id: string }; user: { id: number; role: string } }) => {
  if (!['AGENT', 'LEAD_AGENT'].includes(user.role)) throw new Error('Forbidden');

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
};

export const getComplaintDetails = async ({ params, user }: { params: { id: string }; user: { id: number; role: string } }) => {
  const complaintId = parseInt(params.id);
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: { messages: true, result: true }
  });

  if (!complaint) throw new Error('Complaint not found');

  if (user.role === 'USER' && complaint.userId !== user.id) {
    throw new Error('Forbidden: Not your complaint');
  }

  return complaint;
};

export const classifyComplaint = async ({ params, user }: { params: { id: string }; user: { id: number; role: string } }) => {
  if (!['AGENT', 'LEAD_AGENT'].includes(user.role)) throw new Error('Forbidden');

  // Placeholder: Mock classification
  return { classification: 'Bug Report' };
};

export const summarizeComplaint = async ({ params, user }: { params: { id: string }; user: { id: number; role: string } }) => {
  if (!['AGENT', 'LEAD_AGENT'].includes(user.role)) throw new Error('Forbidden');

  // Placeholder
  return { summary: 'This is a summary of the complaint.' };
};

export const suggestResponse = async ({ params, user }: { params: { id: string }; user: { id: number; role: string } }) => {
  if (!['AGENT', 'LEAD_AGENT'].includes(user.role)) throw new Error('Forbidden');

  // Placeholder
  return { suggestion: 'Suggested response draft.' };
};