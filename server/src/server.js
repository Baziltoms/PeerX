import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
if (!process.env.JWT_SECRET) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is missing.');
  console.error('Please configure JWT_SECRET in server/.env before starting the server.');
  process.exit(1);
}

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { User } from './models/index.js';
import { seedData } from './seed/seed.js';

const INITIAL_PORT = Number(process.env.PORT) || 5001;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty (e.g. running in-memory or on a fresh clone)
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[PeerX Server] No existing users found. Auto-populating initial demo data...');
        await seedData();
      }
    } catch (seedErr) {
      console.warn('[PeerX Server] Note on auto-seed check:', seedErr.message);
    }

    const listenOnPort = (port) => {
      const server = app.listen(port, () => {
        console.log(`====================================================`);
        console.log(`  PEERX ACADEMIC & PEER-TO-PEER PLATFORM API SERVER  `);
        console.log(`====================================================`);
        console.log(`  Status: Running`);
        console.log(`  Port:   http://localhost:${port}`);
        console.log(`  Health: http://localhost:${port}/api/health`);
        console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`====================================================\n`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[Server] Port ${port} is occupied (e.g., macOS AirPlay Receiver).`);
          console.log(`[Server] Retrying automatically on port ${port + 1}...`);
          listenOnPort(port + 1);
        } else {
          console.error('[Server] Fatal server error:', err);
          process.exit(1);
        }
      });

      const shutdown = async (signal) => {
        console.log(`\n[Server] Received ${signal}. Closing HTTP server gracefully...`);
        server.close(async () => {
          await disconnectDB();
          process.exit(0);
        });
      };

      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));
    };

    listenOnPort(INITIAL_PORT);
  } catch (error) {
    console.error('Failed to start PeerX server:', error);
    process.exit(1);
  }
};

startServer();
