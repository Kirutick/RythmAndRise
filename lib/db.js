// lib/db.js
import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  
  if (cached.conn) {
    console.log('  Using cached MongoDB connection');
    return cached.conn;
  }

  // ✅ Check if URI is actually defined
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      ' MONGODB_URI is not defined. Add it to Vercel Environment Variables.'
    );
  }

  //  Only create a new promise if one isn't already in progress
  if (!cached.promise) {
    console.log('🔌 Connecting to MongoDB...');

    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // fail fast — don't hang for 30s
        socketTimeoutMS: 10000,
      })
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected successfully');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error(' MongoDB connection failed:', err.message);
        cached.promise = null; // ✅ Reset so next request can retry
        throw err;             // ✅ Bubble up to route handler
      });
  }

  // ✅ Await and cache the connection
  cached.conn = await cached.promise;
  return cached.conn;
}