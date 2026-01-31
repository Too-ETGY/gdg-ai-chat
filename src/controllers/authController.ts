import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRegisterSchema, UserLoginSchema } from '../schemas';

const JWT_SECRET = process.env.JWT_SECRET!;

export const register = async ({ body }: { body: typeof UserRegisterSchema.static }) => {
  if (!['USER', 'AGENT', 'LEAD_AGENT'].includes(body.role)) {
    throw new Error('Invalid role');
  }

  const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      role: body.role,
      birthDate: new Date(body.birthDate),
      gender: body.gender
    }
  });

  return { message: 'User registered successfully', userId: user.id };
};

export const login = async ({ body }: { body: typeof UserLoginSchema.static }) => {
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(body.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

  return { token, user: { id: user.id, email: user.email, role: user.role } };
};