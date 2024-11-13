import { fastify, FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import BrowserRoute from './routes/browser';
import ToolResearchRoute from './routes/tool-research';

// const PORT = process.env.PORT || 3000;
const PORT = 3000
const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
  logger: false
});
server.register(BrowserRoute)
server.register(ToolResearchRoute)

const start = async () => {
  try {
    await server.listen({port: PORT})
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
start()