import mongoose from 'mongoose';

/**
 * Global cache used to preserve Mongoose connection across serverless invocations
 * and development hot-reloads on Vercel.
 */
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Safely normalizes the MongoDB URI to ensure special characters in passwords
 * are properly URL-encoded without double-encoding existing percent-encodings.
 */
function normalizeMongoUri(rawUri: string): string {
  const trimmed = rawUri.trim();
  const prefixMatch = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!prefixMatch) return trimmed;

  const prefix = prefixMatch[1]; // "mongodb+srv://" or "mongodb://"
  const rest = prefixMatch[2];   // "user:pass@host/db?query"

  const lastAtIndex = rest.lastIndexOf('@');
  if (lastAtIndex === -1) {
    return trimmed;
  }

  const credentialsPart = rest.slice(0, lastAtIndex); // "user:pass"
  const hostAndRest = rest.slice(lastAtIndex + 1);   // "host/db?query"

  const firstColonIndex = credentialsPart.indexOf(':');
  if (firstColonIndex === -1) {
    return trimmed;
  }

  const username = credentialsPart.slice(0, firstColonIndex);
  const password = credentialsPart.slice(firstColonIndex + 1);

  try {
    const decodedPassword = decodeURIComponent(password);
    const encodedPassword = encodeURIComponent(decodedPassword);
    const decodedUsername = decodeURIComponent(username);
    const encodedUsername = encodeURIComponent(decodedUsername);
    return `${prefix}${encodedUsername}:${encodedPassword}@${hostAndRest}`;
  } catch {
    return trimmed;
  }
}

/**
 * Validates connection URI without leaking any sensitive credentials.
 */
function validateMongoUri(): { uri: string | null; exists: boolean; safeReason?: string } {
  const raw = process.env.MONGODB_URI;
  if (!raw || !raw.trim()) {
    return {
      uri: null,
      exists: false,
      safeReason: 'MONGODB_URI is not defined in environment variables.',
    };
  }

  const trimmed = raw.trim();

  if (trimmed.includes('<db_password>')) {
    return {
      uri: null,
      exists: true,
      safeReason: 'MONGODB_URI contains unreplaced placeholder <db_password>. Please configure the actual database password in Vercel Environment Variables.',
    };
  }

  if (trimmed.includes('<username>')) {
    return {
      uri: null,
      exists: true,
      safeReason: 'MONGODB_URI contains unreplaced placeholder <username>.',
    };
  }

  if (trimmed.includes('password@cluster0.mahasetu')) {
    return {
      uri: null,
      exists: true,
      safeReason: 'MONGODB_URI contains placeholder password from example template.',
    };
  }

  return { uri: normalizeMongoUri(trimmed), exists: true };
}

let lastDbError: string | null = null;

export function getLastDbError(): string | null {
  return lastDbError;
}

export function getDbDiagnostics() {
  const raw = process.env.MONGODB_URI || '';
  const exists = Boolean(raw && raw.trim());
  const hasDbPasswordPlaceholder = raw.includes('<db_password>');
  const hasUsernamePlaceholder = raw.includes('<username>');
  const hasExamplePlaceholder = raw.includes('password@cluster0.mahasetu');

  return {
    uriConfigured: exists,
    placeholderDetected: hasDbPasswordPlaceholder || hasUsernamePlaceholder || hasExamplePlaceholder,
    placeholderType: hasDbPasswordPlaceholder
      ? '<db_password>'
      : hasUsernamePlaceholder
      ? '<username>'
      : hasExamplePlaceholder
      ? 'example_cluster'
      : null,
    lastError: lastDbError,
  };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  console.log('[DB] Attempting MongoDB connection');

  const { uri, exists, safeReason } = validateMongoUri();
  console.log(`[DB] MONGODB_URI exists: ${exists}`);

  if (!uri) {
    lastDbError = safeReason || 'Invalid configuration';
    console.error(`[DB] MongoDB connection failed: ${lastDbError}`);
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, // 15s for Atlas serverless handshake across regions
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to prevent serverless dual-stack IPv6 DNS delays
      maxPoolSize: 10,
      minPoolSize: 1,
      dbName: 'mahasetu', // Guarantees unified single source of truth database
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        lastDbError = null;
        console.log('[DB] MongoDB connection successful');
        return m;
      })
      .catch((err) => {
        const safeMessage = err?.message || 'Unknown network or driver error';
        lastDbError = safeMessage;
        console.error(`[DB] MongoDB connection failed: ${safeMessage}`);
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch {
    cached.promise = null;
    cached.conn = null;
    return null;
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
