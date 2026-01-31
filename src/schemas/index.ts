import { t } from 'elysia';
// Import generated TypeBox schemas from Prisma
import { User, Complaint, Message, ComplaintResult, UserRole, ComplaintStatus, SenderRole, Sentiment, Gender, ComplaintCategory } from '../generated/prismabox/barrel';

// Auth Schemas
export const UserRegisterSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 6 }),
  role: t.Enum(UserRole),  // USER, AGENT, LEAD_AGENT
  birthDate: t.String({ format: 'date' }),  // ISO date string
  gender: t.Enum(Gender)
});

export const UserLoginSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String()
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
  category: t.Optional(t.Enum(ComplaintCategory)),  // Optional on create
  priority: t.Optional(t.Number({ minimum: 1, maximum: 5 }))  // Optional
});

export const ComplaintQuerySchema = t.Object({
  status: t.Optional(t.Enum(ComplaintStatus)),
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
  sentiment: t.Optional(t.Enum(Sentiment)),
  createdAt: t.Date(),
  updatedAt: t.Date()
  // Note: 'complaint' field omitted as it's not included in the Prisma query
});

// Updated to match Prisma query with includes (user, assignedAgent, messages, result)
// export const ComplaintResponseSchema = t.Object({
//   id: t.Number(),
//   userId: t.Number(),
//   assignedAgentId: t.Optional(t.Number()),
//   status: t.Enum(ComplaintStatus),
//   category: t.Optional(t.Enum(ComplaintCategory)),
//   priority: t.Optional(t.Number()),
//   createdAt: t.Date(),
//   resolvedAt: t.Optional(t.Date()),
//   resolvedByUserAt: t.Optional(t.Date()),
//   user: User,  // Included in query
//   assignedAgent: t.Optional(User),  // Included in query
//   messages: t.Array(Message),  // Included in query
//   result: t.Optional(ComplaintResultSchema)  // Partial, included in query
// });

// For the list response: { complaints: [...] }
// export const ComplaintListResponseSchema = t.Array(ComplaintResponseSchema);

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

// ... (existing imports)

// Response-specific schemas (omit sensitive/private fields for security)
export const UserResponseSchema = t.Object({
  id: t.Number(),
  email: t.String(),
  role: t.String(),
  birthDate: t.Date(),  // Include if needed; omit if sensitive
  gender: t.String(),   // Include if needed; omit if sensitive
  createdAt: t.Date(),
  updatedAt: t.Date()
  // Omitted: passwordHash (sensitive)
});

export const MessageResponseSchema = t.Object({
  id: t.Number(),
  complaintId: t.Number(),
  senderId: t.Number(),
  senderRole: t.String(),
  content: t.String(),
  createdAt: t.Date()
  // Matches Message but ensures no extras
});

export const ComplaintResultResponseSchema = t.Object({
  id: t.Number(),
  complaintId: t.Number(),
  classification: t.Optional(t.String()),
  suggestedResponse: t.Optional(t.String()),
  summary: t.Optional(t.String()),
  sentiment: t.Optional(t.String()),  // Use string for enum values
  createdAt: t.Date(),
  updatedAt: t.Date()
  // Omitted: complaint (not included in query, avoids circularity)
});

// Updated ComplaintResponseSchema using response-specific subschemas
export const ComplaintResponseSchema = t.Object({
  id: t.Number(),
  userId: t.Number(),
  assignedAgentId: t.Optional(t.Number()),  // Nullable in DB
  status: t.Enum(ComplaintStatus),  // Enum, not string
  category: t.Optional(t.Enum(ComplaintCategory)),  // Enum, optional
  priority: t.Optional(t.Number()),  // Optional (null in DB)
  createdAt: t.Date(),
  resolvedAt: t.Optional(t.Date()),
  resolvedByUserAt: t.Optional(t.Date()),
  user: UserResponseSchema,
  assignedAgent: t.Optional(UserResponseSchema),
  messages: t.Array(MessageResponseSchema),
  result: t.Optional(ComplaintResultResponseSchema)
});

// For list: Direct array (no wrapper object)
export const ComplaintListResponseSchema = t.Array(ComplaintResponseSchema);