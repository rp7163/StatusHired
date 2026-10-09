import mongoose from 'mongoose';

let memoryServer = null;

/**
 * Connect to MongoDB.
 *  - Uses MONGODB_URI by default.
 *  - If USE_MEMORY_DB=true (or no URI is configured) an in-memory MongoDB is started
 *    via mongodb-memory-server so the app runs without installing Mongo.
 */
export async function connectDB() {
  const useMemory = process.env.USE_MEMORY_DB === 'true' || !process.env.MONGODB_URI;
  let uri = process.env.MONGODB_URI;

  if (useMemory) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({ instance: { dbName: 'statushired' } });
    uri = memoryServer.getUri('statushired');
    console.log('[db] Using in-memory MongoDB (data resets on restart)');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`[db] Connected to MongoDB: ${mongoose.connection.name}`);
  return mongoose.connection;
}

export function dbStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
