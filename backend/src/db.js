const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

// Reuse PrismaClient in development to avoid exhausting connections during
// hot-reloads. Create the client once and attach to global.
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Try to connect early so startup fails fast if DATABASE_URL is missing/invalid.
// In production we want to crash if DB is unreachable. In local development
// it's often convenient to run the frontend without a DB available, so don't
// exit the process — instead log the error and let routes handle connection
// attempts lazily.
(async () => {
  try {
    await prisma.$connect();
    console.log('Prisma connected to database');
  } catch (err) {
    console.error('Prisma failed to connect to the database. Check DATABASE_URL and network:');
    console.error(err);
    if (process.env.NODE_ENV === 'production') {
      // In production, fail fast so deploys don't succeed with a broken DB.
      process.exit(1);
    } else {
      // In development, continue running so frontend work can proceed.
      console.warn('Continuing in development mode without an active DB connection. Some routes will fail until the DB is reachable.');
    }
  }
})();

module.exports = prisma;
