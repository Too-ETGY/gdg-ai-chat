import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/authRoutes';
import { analyticsRoutes } from './routes/analyticsRoutes';
import { complaintRoutes } from './routes/complaintsRoutes';
import { chatRoutes } from './routes/chatRoutes';
import { startCleanupJob } from './job/chatCleanUp';

const app = new Elysia()
  .use(swagger({ path: '/docs' }))
  .use(cors())

  .get('/', () => 'Konek bos!!')

  .use(authRoutes)
  .use(analyticsRoutes)
  .use(complaintRoutes)
  .use(chatRoutes);

// Local dev — start the server normally
if (process.env.NODE_ENV !== 'production') {
  app.listen(3000);
  startCleanupJob();
  console.log('Server running on http://localhost:3000');
}

// Vercel — export the fetch handler
export default {
  fetch: app.fetch
};