import { Elysia, t } from 'elysia';
import { prisma } from '../lib/prisma';
import { jwtPlugin, authMiddleware } from '../middleware/authMiddleware';
import { summarizeMessages } from '../services/aiService';

export const chatRoutes = new Elysia({ prefix: '/chat' })
  .use(jwtPlugin)
  .derive(authMiddleware)

  // DELETE: Delete a message (own messages only)
  // Broadcasts deletion to the room in real-time
  .delete('/:complaintId/messages/:messageId', async ({ params, user }) => {
    if (!user) throw new Error('Unauthorized');

    const complaintId = parseInt(params.complaintId);
    const messageId = parseInt(params.messageId);

    if (isNaN(complaintId) || isNaN(messageId)) {
      throw new Error('Invalid ID');
    }

    // Find the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, complaintId: true, senderId: true }
    });

    if (!message) throw new Error('Message not found');
    if (message.complaintId !== complaintId) throw new Error('Message does not belong to this complaint');

    // Only the sender can delete their own message
    if (message.senderId !== user.id) {
      throw new Error('Forbidden: You can only delete your own messages');
    }

    await prisma.message.delete({ where: { id: messageId } });

    return { message: 'Message deleted', messageId };
  }, {
    detail: { summary: 'Delete a message (sender only)' },
    params: t.Object({ complaintId: t.String(), messageId: t.String() })
  })

  // POST: Summarize selected messages + get suggested response (AGENT/LEAD_AGENT only, stateless)
  .post('/:complaintId/summarize', async ({ params, body, user }) => {
    if (!user || !['AGENT', 'LEAD_AGENT'].includes(user.role)) {
      throw new Error('Forbidden: Only agents can summarize messages');
    }

    const complaintId = parseInt(params.complaintId);
    if (isNaN(complaintId)) throw new Error('Invalid complaint ID');

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { assignedAgentId: true, category: true }
    });

    if (!complaint) throw new Error('Complaint not found');

    if (user.role === 'AGENT' && complaint.assignedAgentId !== user.id) {
      throw new Error('Forbidden: Not your assigned complaint');
    }

    const messages = await prisma.message.findMany({
      where: {
        complaintId,
        ...(body.messageIds && body.messageIds.length > 0
          ? { id: { in: body.messageIds } }
          : {})
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        senderRole: true,
        createdAt: true
      }
    });

    if (messages.length === 0) throw new Error('No messages found to summarize');

    // Call AI service
    const { summary, suggestedResponses } = await summarizeMessages(
      messages.map((m: { senderRole: 'USER' | 'AGENT', content: string }) => ({ senderRole: m.senderRole, content: m.content })),
      complaint.category ?? null
    );

    return {
      summary,
      suggestedResponses,
      messageCount: messages.length,
      messageIds: messages.map((m: { id: number }) => m.id)
    };
  }, {
    detail: { summary: 'Summarize selected messages + get suggested response (AGENT/LEAD_AGENT only, stateless)' },
    params: t.Object({ complaintId: t.String() }),
    body: t.Object({
      messageIds: t.Optional(t.Array(t.Number()))  // Empty = summarize all messages
    })
  })

  // WebSocket: Real-time chat per complaint
  // Connect: ws://localhost:3000/chat/:complaintId/ws
  // History is sent automatically on connect
  .ws('/:complaintId/ws', {
    body: t.Object({
      type: t.Union([
        t.Literal('message'),
        t.Literal('typing'),
        t.Literal('stopTyping'),
        t.Literal('deleteMessage')
      ]),
      content: t.Optional(t.String()),    // For type: 'message'
      messageId: t.Optional(t.Number())   // For type: 'deleteMessage'
    }),

    async open(ws) {
      const complaintId = parseInt(ws.data.params.complaintId);
      const user = ws.data.user;
      const roomChannel = `complaint:${complaintId}`;

      if (!user) {
        ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
        ws.close();
        return;
      }

      if (isNaN(complaintId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid complaint ID' }));
        ws.close();
        return;
      }

      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
        select: { id: true, userId: true, assignedAgentId: true, status: true }
      });

      if (!complaint) {
        ws.send(JSON.stringify({ type: 'error', message: 'Complaint not found' }));
        ws.close();
        return;
      }

      if (complaint.status === 'RESOLVED') {
        ws.send(JSON.stringify({ type: 'error', message: 'Complaint is already resolved' }));
        ws.close();
        return;
      }

      // Access check
      const isUser = user.role === 'USER' && complaint.userId === user.id;
      const isAssignedAgent = (user.role === 'AGENT' || user.role === 'LEAD_AGENT') &&
                               complaint.assignedAgentId === user.id;
      const isLeadAgent = user.role === 'LEAD_AGENT';

      if (!isUser && !isAssignedAgent && !isLeadAgent) {
        ws.send(JSON.stringify({ type: 'error', message: 'Forbidden' }));
        ws.close();
        return;
      }

      // Join complaint room
      ws.subscribe(roomChannel);

      // Send full history to the connecting user
      const history = await prisma.message.findMany({
        where: { complaintId },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, role: true } }
        }
      });

      ws.send(JSON.stringify({ type: 'history', messages: history }));

      // Notify others
      ws.publish(roomChannel, JSON.stringify({
        type: 'userJoined',
        userId: user.id,
        role: user.role
      }));

      console.log(`[WS] User ${user.id} (${user.role}) joined room ${roomChannel}`);
    },

    async message(ws, body) {
      const complaintId = parseInt(ws.data.params.complaintId);
      const user = ws.data.user;
      const roomChannel = `complaint:${complaintId}`;

      if (!user) {
        ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
        return;
      }

      if (body.type === 'message') {
        if (!body.content || body.content.trim().length === 0) {
          ws.send(JSON.stringify({ type: 'error', message: 'Message content is empty' }));
          return;
        }

        if (body.content.length > 5000) {
          ws.send(JSON.stringify({ type: 'error', message: 'Message too long (max 5000 chars)' }));
          return;
        }

        // Re-check complaint is still active
        const complaint = await prisma.complaint.findUnique({
          where: { id: complaintId },
          select: { status: true }
        });

        if (!complaint || complaint.status === 'RESOLVED') {
          ws.send(JSON.stringify({ type: 'error', message: 'Complaint is resolved' }));
          return;
        }

        const senderRole: 'USER' | 'AGENT' = user.role === 'USER' ? 'USER' : 'AGENT';

        const savedMessage = await prisma.message.create({
          data: {
            complaintId,
            senderId: user.id,
            senderRole,
            content: body.content.trim()
          },
          include: {
            sender: { select: { id: true, name: true, role: true } }
          }
        });

        const outgoing = JSON.stringify({
          type: 'message',
          id: savedMessage.id,
          complaintId,
          senderId: savedMessage.senderId,
          senderRole: savedMessage.senderRole,
          content: savedMessage.content,
          createdAt: savedMessage.createdAt,
          sender: savedMessage.sender
        });

        // Publish to others + send to self
        ws.publish(roomChannel, outgoing);
        ws.send(outgoing);

      } else if (body.type === 'deleteMessage') {
        if (!body.messageId) {
          ws.send(JSON.stringify({ type: 'error', message: 'messageId is required' }));
          return;
        }

        const message = await prisma.message.findUnique({
          where: { id: body.messageId },
          select: { id: true, complaintId: true, senderId: true }
        });

        if (!message) {
          ws.send(JSON.stringify({ type: 'error', message: 'Message not found' }));
          return;
        }

        if (message.complaintId !== complaintId) {
          ws.send(JSON.stringify({ type: 'error', message: 'Message does not belong to this complaint' }));
          return;
        }

        if (message.senderId !== user.id) {
          ws.send(JSON.stringify({ type: 'error', message: 'You can only delete your own messages' }));
          return;
        }

        await prisma.message.delete({ where: { id: body.messageId } });

        const outgoing = JSON.stringify({
          type: 'messageDeleted',
          messageId: body.messageId,
          complaintId
        });

        ws.publish(roomChannel, outgoing);
        ws.send(outgoing);

      } else if (body.type === 'typing') {
        ws.publish(roomChannel, JSON.stringify({
          type: 'typing',
          userId: user.id,
          isTyping: true
        }));

      } else if (body.type === 'stopTyping') {
        ws.publish(roomChannel, JSON.stringify({
          type: 'typing',
          userId: user.id,
          isTyping: false
        }));
      }
    },

    close(ws) {
      const complaintId = parseInt(ws.data.params.complaintId);
      const user = ws.data.user;
      const roomChannel = `complaint:${complaintId}`;

      ws.unsubscribe(roomChannel);

      if (user) {
        ws.publish(roomChannel, JSON.stringify({
          type: 'userLeft',
          userId: user.id,
          role: user.role
        }));
      }

      console.log(`[WS] User ${user?.id} left room ${roomChannel}`);
    }
  });