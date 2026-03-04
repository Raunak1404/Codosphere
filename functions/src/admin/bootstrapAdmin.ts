/**
 * One-time migration script to set the admin custom claim on the existing admin UID.
 *
 * Run with:
 *   cd functions
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json \
 *     npx ts-node --project tsconfig.json src/admin/bootstrapAdmin.ts
 *
 * After running, the admin user must log out and back in (or force-refresh the
 * ID token) for the new custom claim to take effect in the frontend.
 */

import * as admin from 'firebase-admin';

const ADMIN_UID = '6PoYJdCdqWQYZ66ue6sn6TZcTj33';

async function bootstrap() {
  admin.initializeApp();
  const auth = admin.auth();

  console.log(`Setting admin custom claim for UID: ${ADMIN_UID}`);
  await auth.setCustomUserClaims(ADMIN_UID, { admin: true });

  // Revoke existing tokens so the claim takes effect on next token refresh
  await auth.revokeRefreshTokens(ADMIN_UID);

  const user = await auth.getUser(ADMIN_UID);
  console.log('Custom claims set:', user.customClaims);
  console.log('Done. The admin user must log out and back in to pick up the new claim.');
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
