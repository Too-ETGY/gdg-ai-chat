import { t } from 'elysia';
// Import generated TypeBox schemas from Prisma
import { User, Complaint, Message, ComplaintResult, UserRole, ComplaintStatus, SenderRole, Sentiment, Gender, ComplaintCategory, __nullable__ } from '../generated/prismabox/barrel';

// Auth Schemas
export const UserRegisterSchema = t.Object({
  name: t.String({ minLength: 2, maxLength: 100 }),
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 6 }),
  birthDate: t.String({ format: 'date' }),  // ISO date string
  gender: t.Union([
    t.Literal('MALE'),
    t.Literal('FEMALE')
  ])
});

export const UserLoginSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String()
});

// Response-specific schemas (omit sensitive/private fields for security)
export const UserResponseSchema = t.Object({
  id: t.Number(),
  name: t.String(),  // Add this - it's missing
  email: t.String(),
  role: UserRole,  // Remove t.Enum()
  birthDate: t.Date(),
  gender: Gender,  // Remove t.Enum()
  createdAt: t.Date(),
  updatedAt: t.Date()
});

export const AuthResponseSchema = t.Object({
  token: t.String(),
  user: t.Object({
    id: t.Number(),
    email: t.String(),
    role: t.String()
  })
});

// Complaint Schemas
export const ComplaintCreateSchema = t.Object({
  category: t.Optional(ComplaintCategory),  // Optional on create
});

export const ComplaintQuerySchema = t.Object({
  status: t.Optional(ComplaintStatus),
  priority: t.Optional(t.Number({ minimum: 1, maximum: 5 }))
});

export const ComplaintAssignSchema = t.Object({});  // No body needed, just POST

// export const ComplaintResponseSchema = t.Object({
//   ...Complaint.properties,  // Spread generated Complaint schema
//   messages: t.Array(Message),  // Include messages
//   result: t.Optional(ComplaintResult)  // Include AI result if exists
// });

// export const ComplaintListResponseSchema = t.Array(ComplaintResponseSchema);  // For inbox

// Custom partial for ComplaintResult (omits 'complaint' to avoid circularity in responses)
export const ComplaintResultSchema = t.Object({
  id: t.Number(),
  complaintId: t.Number(),
  classification: t.Optional(t.String()),
  suggestedResponse: t.Optional(t.String()),
  summary: t.Optional(t.String()),
  sentiment: t.Optional(Sentiment),
  createdAt: t.Date(),
  updatedAt: t.Date()
  // Note: 'complaint' field omitted as it's not included in the Prisma query
});

export const ComplaintResultResponseSchema = t.Object({
  id: t.Number(),
  complaintId: t.Number(),
  classification: __nullable__(t.String()),  // Nullable
  suggestedResponse: __nullable__(t.String()),  // Nullable
  summary: __nullable__(t.String()),  // Nullable
  sentiment: __nullable__(Sentiment),  // Enum + nullable
  createdAt: t.Date(),
  updatedAt: t.Date()
});

export const MessageResponseSchema = t.Object({
  id: t.Number(),
  complaintId: t.Number(),
  senderId: t.Number(),
  senderRole: SenderRole,  // Use the generated Union directly
  content: t.String(),
  createdAt: t.Date()
});

// Updated to match Prisma query with includes (user, assignedAgent, messages, result)
export const ComplaintResponseSchema = t.Object({
  id: t.Number(),
  userId: t.Number(),
  assignedAgentId: __nullable__(t.Number()),  // Nullable
  status: ComplaintStatus,  // Enum
  category: __nullable__(ComplaintCategory),  // Enum + nullable
  priority: __nullable__(t.Number()),  // Nullable
  createdAt: t.Date(),
  resolvedAt: __nullable__(t.Date()),  // Nullable
  resolvedByUserAt: __nullable__(t.Date()),  // Nullable
  user: UserResponseSchema,
  assignedAgent: __nullable__(UserResponseSchema),  // Nullable
  messages: t.Array(MessageResponseSchema),
  result: __nullable__(ComplaintResultResponseSchema)  // Nullable
});

// List for inbox
export const ComplaintListResponseSchema = t.Array(ComplaintResponseSchema);

// AI Schemas (placeholders, responses are mocks for now)
export const ClassifyResponseSchema = t.Object({
  classification: t.String()
});

export const SummarizeResponseSchema = t.Object({
  summary: t.String()
});

export const SuggestResponseSchema = t.Object({
  suggestion: t.String()
});

// Analytics Schemas
export const SentimentTrendsResponseSchema = t.Object({
  trends: t.Record(t.String(), t.Number())  // e.g., { POSITIVE: 10, NEGATIVE: 5 }
});

// Chat Schemas (for WS message payloads)
export const ChatMessageSchema = t.Object({
  type: t.Literal('message'),
  content: t.String()
});

export const ChatBroadcastSchema = t.Object({
  type: t.Union([t.Literal('message'), t.Literal('userJoined'), t.Literal('userLeft')]),
  id: t.Optional(t.Number()),  // For messages
  sender: t.Optional(t.String()),  // USER or AGENT
  content: t.Optional(t.String()),
  createdAt: t.Optional(t.String({ format: 'date-time' })),
  userId: t.Optional(t.Number())  // For joins/leaves
});
