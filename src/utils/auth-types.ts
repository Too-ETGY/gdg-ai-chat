import type { Context } from 'elysia';

export type AuthContexts = Context & {
  user: {
    id: number;
    role: 'USER' | 'AGENT' | 'LEAD_AGENT';
  };
};
