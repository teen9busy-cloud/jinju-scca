import crypto from 'crypto';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
// 세션 서명 키 분리 (별도 지정 없으면 환경변수 기반 보안 솔트 사용)
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'jinju-scca-session-secret-key-32bytes-secure-salt-2026';
const COOKIE_NAME = 'jinju_admin_session';

/**
 * 관리자 비밀번호 타이밍 안전(timing-safe) 검증 (Fail-closed)
 */
export function verifyAdminPassword(input: string): boolean {
  if (!input || !ADMIN_PASSWORD) return false;
  try {
    const inputBuf = Buffer.from(input, 'utf8');
    const secretBuf = Buffer.from(ADMIN_PASSWORD, 'utf8');
    if (inputBuf.length !== secretBuf.length) return false;
    return crypto.timingSafeEqual(inputBuf, secretBuf);
  } catch (e) {
    return false;
  }
}

/**
 * HMAC-SHA256 기반 관리자 세션 토큰 생성 (독립 세션 시크릿 사용)
 */
export function createAdminSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * 관리자 세션 토큰 유효성 검증 (7일 만료)
 */
export function verifyAdminSessionToken(token: string): boolean {
  if (!token || !token.includes('.')) return false;
  try {
    const [timestampStr, signature] = token.split('.');
    const timestamp = parseInt(timestampStr, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7일

    if (isNaN(timestamp) || Date.now() - timestamp > maxAge) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(timestampStr)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSignature, 'hex');

    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (e) {
    return false;
  }
}

/**
 * 요청의 HttpOnly 쿠키에서 관리자 세션 검증
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return false;
    return verifyAdminSessionToken(sessionCookie.value);
  } catch (e) {
    return false;
  }
}

/**
 * 관리자 세션 쿠키 설정
 */
export async function setAdminSessionCookie(): Promise<void> {
  const token = createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7일
    path: '/',
  });
}

/**
 * 관리자 세션 쿠키 삭제 (로그아웃)
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * OWASP 권장 단방향 PBKDF2 비밀번호 해싱 (100,000회 반복)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

/**
 * 비밀번호 검증 (새 10만회 PBKDF2, 기존 1천회 PBKDF2 및 레거시 평문 하위 호환)
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  
  // 레거시 평문 비밀번호 호환
  if (!storedHash.startsWith('pbkdf2$')) {
    return password === storedHash;
  }

  try {
    const parts = storedHash.split('$');
    let iterations = 1000;
    let salt = '';
    let hash = '';

    if (parts.length === 3) {
      // 구버전 pbkdf2$salt$hash (1000회)
      salt = parts[1];
      hash = parts[2];
    } else if (parts.length === 4) {
      // 신버전 pbkdf2$iterations$salt$hash (100,000회)
      iterations = parseInt(parts[1], 10);
      salt = parts[2];
      hash = parts[3];
    } else {
      return false;
    }

    const testHash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const testBuf = Buffer.from(testHash, 'hex');
    if (hashBuf.length !== testBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, testBuf);
  } catch (e) {
    return false;
  }
}
