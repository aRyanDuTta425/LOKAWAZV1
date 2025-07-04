const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// ✅ DO NOT use prisma.$on('beforeExit') in Prisma 5+


//this connection function is used to connect to the database and should be called at the start of your application, typically in your main server file.
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

//this disconnect function is used to disconnect from the database and should be called when your application is shutting down, typically in a cleanup function.
async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
}

// Check database connection status
async function checkConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database connection check failed:', error);
    return false;
  }
}

// Exporting the prisma client and connection functions
module.exports = {
  prisma,
  connectDB,
  disconnectDB,
  checkConnection,
};
