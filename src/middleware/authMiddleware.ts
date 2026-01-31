import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';

// export const authMiddleware = new Elysia()
//   .decorate('user', null as AuthUser | null)
//   .use(jwt({ secret: process.env.JWT_SECRET! }))
//   .derive(async ({ jwt, headers, query }) => {
//     const token = headers.authorization?.split(' ')[1] || (query as any)?.token;
//     if (!token) {
//       throw new Error('Unauthorized: No token provided');
//     }

//     try {
//       const payload = await jwt.verify(token);
//       return { user: payload };  // Includes { id: number, role: string }
//     } catch (err) {
//       throw new Error('Unauthorized: Invalid token');
//     }
//   });

export type JwtUser = {
  id: number;
  role: string;
};

export const authMiddleware = new Elysia()
  .decorate('user', null as JwtUser | null)
  .use(jwt({ secret: process.env.JWT_SECRET! }))
  .derive(async ({ jwt, headers, query }) => {
    const token =
      headers.authorization?.split(' ')[1] ||
      (query as any)?.token;

    if (!token) throw new Error('Unauthorized');

    const payload = await jwt.verify(token);

    return {
      user: payload as JwtUser
    };
  });


// Helper for role checks (use in routes)
export const requireRole = (allowedRoles: string[]) => (ctx: any) => {
  if (!allowedRoles.includes(ctx.user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  return ctx;
};