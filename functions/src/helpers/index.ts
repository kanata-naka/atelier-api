import * as admin from "firebase-admin";
import { CallableContext, HttpsError } from "firebase-functions/v1/https";

export async function withAuthentication(context: CallableContext, callback: () => unknown) {
  if (!(await hasAdminUserClaim(context))) {
    throw new HttpsError("unauthenticated", "");
  }
  return callback();
}

async function hasAdminUserClaim(context: CallableContext) {
  if (!context.auth) {
    return false;
  }
  const user = await admin.auth().getUser(context.auth.uid);
  return user.customClaims && (user.customClaims as { admin: boolean }).admin;
}
