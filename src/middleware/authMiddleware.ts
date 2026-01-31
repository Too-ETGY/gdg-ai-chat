// import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';

export type JwtUser = {
  id: number;
  role: string;
};

// Don't export this as a separate Elysia instance
export const jwtPlugin = jwt({ secret: process.env.JWT_SECRET! });

export const authMiddleware = async ({ jwt, headers, query }: any) => {
  // console.log('🔍 Middleware STARTED');
  // console.log('Headers:', headers);
  
  const token = headers.authorization?.split(' ')[1] || query?.token;
  // console.log('Token:', token ? 'Present' : 'Missing');
  
  if (!token) throw new Error('Unauthorized: No token provided');
  
  try {
    const payload = await jwt.verify(token);
    // console.log('Payload:', payload);
    return { user: payload as JwtUser };
  } catch (err) {
    console.log('JWT verify error:', err);
    throw new Error('Unauthorized: Invalid token');
  }
};