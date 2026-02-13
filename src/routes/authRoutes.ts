import {Elysia, t} from 'elysia';
import { register, login } from '../controllers/authController';
import { UserRegisterSchema, UserLoginSchema, AuthResponseSchema } from '../schemas';
import { authMiddleware, jwtPlugin } from '../middleware/authMiddleware';

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
  })
  
  .use(jwtPlugin)
  .derive(authMiddleware)
  .post('/logout', ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { message: 'Not logged in' };
    }
    set.status = 200;
    return { message: 'Logged out successfully' };
  }, {
    detail: { summary: 'Logout user' },
    response: t.Object({ message: t.String() })
  });
