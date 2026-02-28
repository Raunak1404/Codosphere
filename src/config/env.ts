// Typed environment variable accessors with runtime validation.
// Throws a clear error at startup if any required variable is missing.

function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Copy .env.example to .env and fill in the values.`
    );
  }
  return value as string;
}

export const env = {
  firebase: {
    apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
    authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('VITE_FIREBASE_APP_ID'),
    measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || '',
  },
  judge0: {
    apiUrl: requireEnv('VITE_JUDGE0_API_URL'),
    apiKey: requireEnv('VITE_JUDGE0_API_KEY'),
    apiHost: requireEnv('VITE_JUDGE0_API_HOST'),
  },
  // Parse comma-separated admin UIDs from env
  adminUids: ((import.meta.env.VITE_ADMIN_UIDS as string) || '')
    .split(',')
    .map((uid) => uid.trim())
    .filter(Boolean),
} as const;
