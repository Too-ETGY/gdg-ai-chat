import Elysia from 'elysia';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';
import { ChatMessageSchema, ChatBroadcastSchema } from '../schemas';
import { handleChatConnection } from '../controllers/chatController';

export const chatRoutes = new Elysia({ prefix: '/chat' })
  .use(authMiddleware)
  .ws('/:complaintId', handleChatConnection, { ChatMessageSchema, ChatBroadcastSchema });