import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/authRoutes';
import { analyticsRoutes } from './routes/analyticsRoutes';
import { complaintRoutes } from './routes/complaintsRoutes';
import { chatRoutes } from './routes/chatRoutes';
import { startCleanupJob } from './job/chatCleanUp';

const app = new Elysia()
  .use(swagger({ path: '/docs' }))  // OpenAPI docs at /docs
  .use(cors())
  
  .get('/', () => 'Konek bos!!')

  .use(authRoutes)
  .use(analyticsRoutes)
  .use(complaintRoutes)
  .use(chatRoutes)
  .listen(3000);

// Start cleanup job (auto-resolve + message deletion)
startCleanupJob();

console.log('Server running on http://localhost:3000');