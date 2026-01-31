import { prisma } from '../lib/prisma';
import { WSContext } from '@elysiajs/websocket';
import { ChatMessageSchema, ChatBroadcastSchema } from '../schemas';

// Store active connections: Map<complaintId, Set<WebSocket>>
const rooms = new Map<number, Set<WebSocket>>();

export const handleChatConnection = {
  open: async (ws: WSContext<{ params: { complaintId: string }; user: { id: number; role: string } }>) => {
    const complaintId = parseInt(ws.params.complaintId);
    const { user } = ws;

    // Validate complaint exists
    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!complaint) {
      ws.close(1008, 'Complaint not found');
      return;
    }

    // Access check
    if (user.role === 'USER' && complaint.userId !== user.id) {
      ws.close(1008, 'Forbidden');
      return;
    } else if (!['AGENT', 'LEAD_AGENT'].includes(user.role)) {
      ws.close(1008, 'Forbidden');
      return;
    }

    // Add to room
    if (!rooms.has(complaintId)) rooms.set(complaintId, new Set());
    rooms.get(complaintId)!.add(ws);

    // Broadcast join
    broadcast(complaintId, { type: 'userJoined', userId: user.id }, ws);
  },

  message: async (ws: WSContext<{ params: { complaintId: string }; user: { id: number; role: string } }>, message: string) => {
    const complaintId = parseInt(ws.params.complaintId);
    const { user } = ws;

    try {
      const data = JSON.parse(message);
      if (!ChatMessageSchema.safeParse(data).success) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        return;
      }

      // Save to DB
      const newMessage = await prisma.message.create({
        data: {
          complaintId,
          senderId: user.id,
          senderRole: user.role === 'USER' ? 'USER' : 'AGENT',
          content: data.content
        }
      });

      // Broadcast
      broadcast(complaintId, {
        type: 'message',
        id: newMessage.id,
        sender: newMessage.senderRole,
        content: newMessage.content,
        createdAt: newMessage.createdAt.toISOString()
      });
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }));
    }
  },

  close: (ws: WSContext<{ params: { complaintId: string }; user: { id: number; role: string } }>) => {
    const complaintId = parseInt(ws.params.complaintId);
    const { user } = ws;

    const room = rooms.get(complaintId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) rooms.delete(complaintId);
    }

    broadcast(complaintId, { type: 'userLeft', userId: user.id });
  }
};

// Helper: Broadcast to room
function broadcast(complaintId: number, data: typeof ChatBroadcastSchema.static, excludeWs?: WebSocket) {
  const room = rooms.get(complaintId);
  if (!room) return;
  const message = JSON.stringify(data);
  room.forEach(client => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}