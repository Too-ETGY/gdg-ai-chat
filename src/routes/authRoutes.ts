import {Elysia, t} from 'elysia';
import { register, login } from '../controllers/authController';
import { UserRegisterSchema, UserLoginSchema, AuthResponseSchema } from '../schemas';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', register, {
    detail: { summary: 'Register a new user' },
    body: UserRegisterSchema,
    response: t.Object({ message: t.String(), userId: t.Number() })  // Custom response
  })
  .post('/login', login, {
    detail: { summary: 'Login user' },
    body: UserLoginSchema,
    response: AuthResponseSchema
  });