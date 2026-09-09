const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return true;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<db_password>') || uri.includes('password@cluster0.mahasetu')) {
    console.warn('\n⚠️  [MahaSetu DB Notice]: MONGODB_URI contains a placeholder (<db_password>) in .env.');
    console.warn('   Please replace <db_password> with your actual MongoDB Atlas database user password in .env.');
    console.warn('   Backend will attempt connection and continue safely with fallback resilience.\n');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB Atlas Connected]: Host ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ [MongoDB Atlas Connection Error]: ${error.message}`);
    console.warn('⚠️  Database will operate in resilient mode. Please verify your Atlas IP access list and credentials.');
    return false;
  }
}

module.exports = { connectDB, getIsConnected: () => isConnected };
