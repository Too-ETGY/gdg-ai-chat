// import { Elysia, t } from 'elysia';
// import { prisma } from '../lib/prisma';
// import { jwtPlugin, authMiddleware } from '../middleware/authMiddleware';

// export const chatRoutes = new Elysia({ prefix: '/chat' })
//   .use(jwtPlugin)
//   .derive(authMiddleware)

//   // Get all messages for a specific complaint
//   .get('/:complaintId', async ({ params, user }) => {
//     if (!user) throw new Error('Unauthorized');

//     const complaintId = parseInt(params.complaintId);
    
//     // Check if parsing succeeded
//     if (isNaN(complaintId)) {
//       throw new Error('Invalid complaint ID');
//     }

//     // Validate complaint exists and user has access
//     const complaint = await prisma.complaint.findUnique({
//       where: { id: complaintId },
//       select: { 
//         id: true,
//         userId: true, 
//         assignedAgentId: true,
//         status: true
//       }
//     });

//     if (!complaint) {
//       throw new Error('Complaint not found');
//     }

//     // Access check
//     const isUser = user.role === 'USER' && complaint.userId === user.id;
//     const isAssignedAgent = (user.role === 'AGENT' || user.role === 'LEAD_AGENT') && 
//                             complaint.assignedAgentId === user.id;
//     const isLeadAgent = user.role === 'LEAD_AGENT';

//     if (!isUser && !isAssignedAgent && !isLeadAgent) {
//       throw new Error('Forbidden: You do not have access to this complaint');
//     }

//     // Get all messages
//     const messages = await prisma.message.findMany({
//       where: { complaintId },
//       orderBy: { createdAt: 'asc' },
//       include: {
//         sender: {
//           select: {
//             id: true,
//             name: true,
//             role: true
//           }
//         }
//       }
//     });

//     return { messages, complaint };
//   }, {
//     detail: { summary: 'Get all messages for a complaint' },
//     params: t.Object({ complaintId: t.String() })
//   })

//   // Send a message to a complaint
//   .post('/:complaintId/message', async ({ params, body, user }) => {
//     if (!user) throw new Error('Unauthorized');

//     const complaintId = parseInt(params.complaintId);
    
//     if (isNaN(complaintId)) {
//       throw new Error('Invalid complaint ID');
//     }

//     // Validate complaint exists and check access
//     const complaint = await prisma.complaint.findUnique({
//       where: { id: complaintId },
//       select: { 
//         id: true,
//         userId: true, 
//         assignedAgentId: true, 
//         status: true 
//       }
//     });

//     if (!complaint) {
//       throw new Error('Complaint not found');
//     }

//     // Cannot send to resolved complaints
//     if (complaint.status === 'RESOLVED') {
//       throw new Error('Cannot send messages to a resolved complaint');
//     }

//     // Access check
//     const isUser = user.role === 'USER' && complaint.userId === user.id;
//     const isAssignedAgent = (user.role === 'AGENT' || user.role === 'LEAD_AGENT') && 
//                             complaint.assignedAgentId === user.id;

//     if (!isUser && !isAssignedAgent) {
//       throw new Error('Forbidden: You do not have access to this complaint');
//     }

//     // Determine sender role
//     const senderRole: 'USER' | 'AGENT' = user.role === 'USER' ? 'USER' : 'AGENT';

//     // Create message
//     const message = await prisma.message.create({
//       data: {
//         complaintId,
//         senderId: user.id,
//         senderRole,
//         content: body.content
//       },
//       include: {
//         sender: {
//           select: {
//             id: true,
//             name: true,
//             role: true
//           }
//         }
//       }
//     });

//     return { 
//       message: 'Message sent successfully', 
//       data: message 
//     };
//   }, {
//     detail: { summary: 'Send a message to a complaint' },
//     params: t.Object({ complaintId: t.String() }),
//     body: t.Object({
//       content: t.String({ minLength: 1, maxLength: 5000 })
//     })
//   })

//   // Get recent conversations (for inbox/list view)
//   .get('/conversations', async ({ user }) => {
//     if (!user) throw new Error('Unauthorized');

//     let complaints;

//     if (user.role === 'USER') {
//       // Get user's complaints with latest message
//       complaints = await prisma.complaint.findMany({
//         where: { userId: user.id },
//         include: {
//           messages: {
//             orderBy: { createdAt: 'desc' },
//             take: 1,
//             include: {
//               sender: {
//                 select: { id: true, name: true, role: true }
//               }
//             }
//           },
//           assignedAgent: {
//             select: { id: true, name: true, role: true }
//           }
//         },
//         orderBy: { createdAt: 'desc' }
//       });
//     } else {
//       // Get agent's assigned complaints with latest message
//       complaints = await prisma.complaint.findMany({
//         where: { 
//           assignedAgentId: user.id 
//         },
//         include: {
//           messages: {
//             orderBy: { createdAt: 'desc' },
//             take: 1,
//             include: {
//               sender: {
//                 select: { id: true, name: true, role: true }
//               }
//             }
//           },
//           user: {
//             select: { id: true, name: true, email: true }
//           }
//         },
//         orderBy: { createdAt: 'desc' }
//       });
//     }

//     return { conversations: complaints };
//   }, {
//     detail: { summary: 'Get all conversations (complaints with latest message)' }
//   });