import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

const app = new Elysia()
  .use(swagger({ path: '/docs' }))  // OpenAPI docs at /docs
  .use(cors())
  .listen(3000);

console.log('Server running on http://localhost:3000');