const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
