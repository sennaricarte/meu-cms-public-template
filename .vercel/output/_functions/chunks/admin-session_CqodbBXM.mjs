import { timingSafeEqual, createHmac } from 'node:crypto';

const ADMIN_SESSION_COOKIE = "admin_session";
function getAdminCredentials() {
  const rawUser = "sennaricarte";
  const rawPass = "Aurilene@02";
  const rawSecret = "essa";
  const user = rawUser.trim() ;
  const pass = rawPass.trim() ;
  if (!user.length || !pass.length) return null;
  const secret = rawSecret.trim().length ? rawSecret.trim() : pass;
  return { user, pass, secret };
}
function getAdminSessionTokenValue() {
  const creds = getAdminCredentials();
  if (!creds) return null;
  return createHmac("sha256", creds.secret).update("blogonauta:admin:session:" + creds.user).digest("hex");
}
function isValidAdminSession(token) {
  const expected = getAdminSessionTokenValue();
  if (!expected || !token) return false;
  try {
    const a = Buffer.from(token, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
function adminEnvConfigured() {
  return getAdminCredentials() !== null;
}
function timingSafeStringEq(a, b) {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
function requireAdminCookies(cookies) {
  if (!isValidAdminSession(cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    throw new Error("Não autorizado.");
  }
}

export { ADMIN_SESSION_COOKIE as A, adminEnvConfigured as a, getAdminCredentials as b, getAdminSessionTokenValue as g, isValidAdminSession as i, requireAdminCookies as r, timingSafeStringEq as t };
