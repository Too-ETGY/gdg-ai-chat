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
  name: t.String(),
  email: t.String(),
  role: UserRole,
  birthDate: t.Date(),
  gender: Gender,
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
  category: t.Optional(ComplaintCategory),
});

export const ComplaintQuerySchema = t.Object({
  status: t.Optional(ComplaintStatus),
  priority: t.Optional(t.Number({ minimum: 1, maximum: 5 }))
});

export const ComplaintAssignSchema = t.Object({});

// Custom partial for ComplaintResult (omits 'complaint' to avoid circularity in responses)
export const ComplaintResultSchema = t.Object({
  id: t.Number(),
  complaintId: t.Number(),
  classification: t.Optional(t.String()),
  summary: t.Optional(t.String()),
  sentiment: t.Optional(Sentiment),
  createdAt: t.Date(),
  updatedAt: t.Date()
});

export const ComplaintResultResponseSchema = t.Object({
  id: t.Number(),
  complaintId: t.Number(),
  classification: __nullable__(t.String()),
  summary: __nullable__(t.String()),
  sentiment: __nullable__(Sentiment),
  createdAt: t.Date(),
  updatedAt: t.Date()
});

export const MessageResponseSchema = t.Object({
  id: t.Number(),
  complaintId: t.Number(),
  senderId: t.Number(),
  senderRole: SenderRole,
  content: t.String(),
  createdAt: t.Date()
});

export const ComplaintResponseSchema = t.Object({
  id: t.Number(),
  userId: t.Number(),
  assignedAgentId: __nullable__(t.Number()),
  status: ComplaintStatus,
  category: __nullable__(ComplaintCategory),
  priority: __nullable__(t.Number()),
  createdAt: t.Date(),
  resolvedAt: __nullable__(t.Date()),
  resolvedByUserAt: __nullable__(t.Date()),
  user: UserResponseSchema,
  assignedAgent: __nullable__(UserResponseSchema),
  messages: t.Array(MessageResponseSchema),
  result: __nullable__(ComplaintResultResponseSchema)
});

export const ComplaintListResponseSchema = t.Array(ComplaintResponseSchema);

// ─────────────────────────────────────────────
// Analytics Schemas
// ─────────────────────────────────────────────

export const AnalyticsDailyEntrySchema = t.Object({
  date:     t.String(),
  created:  t.Number(),
  resolved: t.Number()
});

export const AnalyticsTodaySchema = t.Object({
  total:       t.Number(),
  OPEN:        t.Number(),
  IN_PROGRESS: t.Number(),
  RESOLVED:    t.Number()
});

export const AnalyticsSentimentCountsSchema = t.Object({
  POSITIVE: t.Number(),
  NEUTRAL:  t.Number(),
  NEGATIVE: t.Number()
});

export const AnalyticsSentimentSchema = t.Object({
  total:      t.Number(),
  counts:     AnalyticsSentimentCountsSchema,
  percentage: AnalyticsSentimentCountsSchema
});

export const AnalyticsResponseSchema = t.Object({
  dailyChart: t.Array(AnalyticsDailyEntrySchema),
  today:      AnalyticsTodaySchema,
  sentiment:  AnalyticsSentimentSchema
});