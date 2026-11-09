import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/peerx';
  try {
    // Attempt standard connection with 2.5s serverSelectionTimeoutMS
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[PeerX Database] Connected successfully to MongoDB at ${uri}`);
  } catch (err) {
    console.warn(`[PeerX Database] Could not connect to external MongoDB: ${err.message}`);

    if (process.env.ENABLE_MEMORY_DB !== 'false') {
      try {
        console.log('[PeerX Database] Initializing embedded in-memory MongoDB fallback...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[PeerX Database] Connected to In-Memory MongoDB at ${memUri}`);
      } catch (memErr) {
        console.error('[PeerX Database] Failed to initialize embedded MongoDB:', memErr);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[PeerX Database] Disconnected successfully');
  } catch (err) {
    console.error('[PeerX Database] Disconnect error:', err);
  }
};
