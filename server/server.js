// Server startup and database connection
const app = require('./app');
const { connectDB, disconnectDB, checkConnection } = require('./src/config/database');
const { DatabaseUtils } = require('./src/models');

// Get port from environment or default to 8000
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    console.log(`🚀 Starting Lok Awaaz API Server...`);
    console.log(`📋 Environment: ${NODE_ENV}`);
    console.log(`🌐 Port: ${PORT}`);

    // Connect to database
    console.log('📊 Connecting to database...');
    await connectDB();
    
    // Verify database connection
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Database connection verification failed');
    }
    console.log('✅ Database connected successfully');

    // Check database metrics
    if (NODE_ENV === 'development') {
      try {
        const metrics = await DatabaseUtils.getMetrics();
        console.log('📈 Database Metrics:', {
          users: metrics.users.total,
          issues: metrics.issues.total,
          recentIssues: metrics.issues.recentCount,
        });
      } catch (error) {
        console.warn('⚠️  Could not fetch database metrics:', error.message);
      }
    }

    // Start Express server
    server = app.listen(PORT, () => {
      console.log('✅ Server started successfully');
      console.log(`🔗 Server running on: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
      console.log('🔄 Server is ready to accept connections');
      
      if (NODE_ENV === 'development') {
        console.log('\n🛠️  Development Tools:');
        console.log(`   • Prisma Studio: npx prisma studio`);
        console.log(`   • Database Reset: npx prisma db reset`);
        console.log(`   • Generate Client: npx prisma generate`);
        console.log(`   • Run Migrations: npx prisma db push\n`);
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('💡 Try using a different port or stop the other process');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Handle server listening
    server.on('listening', () => {
      const addr = server.address();
      const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
      console.log(`🎯 Server listening on ${bind}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    
    // Try to disconnect from database if connection was established
    try {
      await disconnectDB();
    } catch (disconnectError) {
      console.error('❌ Failed to disconnect from database:', disconnectError);
    }
    
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  if (server) {
    console.log('🔌 Closing HTTP server...');
    server.close(async (error) => {
      if (error) {
        console.error('❌ Error closing HTTP server:', error);
      } else {
        console.log('✅ HTTP server closed successfully');
      }

      // Disconnect from database
      try {
        console.log('📊 Disconnecting from database...');
        await disconnectDB();
        console.log('✅ Database disconnected successfully');
      } catch (dbError) {
        console.error('❌ Error disconnecting from database:', dbError);
      }

      // Exit process
      console.log('👋 Graceful shutdown completed');
      process.exit(error ? 1 : 0);
    });

    // Force close after timeout
    setTimeout(() => {
      console.error('⏰ Force closing server after timeout');
      process.exit(1);
    }, 10000); // 10 second timeout

  } else {
    // No server to close, just disconnect from database
    try {
      await disconnectDB();
      console.log('✅ Database disconnected successfully');
    } catch (dbError) {
      console.error('❌ Error disconnecting from database:', dbError);
    }
    process.exit(0);
  }
};

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Handle warning events
process.on('warning', (warning) => {
  if (NODE_ENV === 'development') {
    console.warn('⚠️  Warning:', warning.name, warning.message);
  }
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  server,
  startServer,
  gracefulShutdown,
};
