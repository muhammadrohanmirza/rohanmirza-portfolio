import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connection } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { UserRole } from "@prisma/client";

const COOKIE_NAME = "rohan_admin_session";
const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

// Validate on startup that AUTH_SECRET exists and print a clear error if missing
const startupSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!startupSecret) {
  console.error(
    "\n═══════════════════════════════════════════════════════════════════════════\n" +
    "❌ [AUTH CONFIG ERROR]: AUTH_SECRET is missing in environment variables!\n" +
    "   Sessions cannot be securely validated without a persistent secret key.\n" +
    "   Please add AUTH_SECRET to your .env file.\n" +
    "═══════════════════════════════════════════════════════════════════════════\n"
  );
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.warn("[AUTH DEBUG] Warning: AUTH_SECRET / NEXTAUTH_SECRET is not configured. Falling back to temporary dev secret.");
  }
  return new TextEncoder().encode(secret || "fallback-secret-for-dev-rohan-dev-portfolio-32chars");
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp?: number;
}

/**
 * Signs and encodes a JWT session token.
 */
export async function signSessionToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secretKey);
}

/**
 * Verifies a JWT session token string.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Retrieves and validates the current admin session from request cookies.
 */
export async function getSession(): Promise<SessionPayload | null> {
  await connection();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Asserts that the current request has an active, valid ADMIN session.
 * Used at the entry point of every administrative Server Action and handler.
 */
export async function assertAdminSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Administrative session required.");
  }
  return session;
}

/**
 * Verifies credentials, generates session token, and sets HTTP-only cookie.
 * Logs real failure causes to the server console only for easy debugging.
 */
export async function loginWithCredentials(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const hasSecret = Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
    if (!hasSecret) {
      console.warn("[AUTH DEBUG] Login notice: AUTH_SECRET / NEXTAUTH_SECRET is missing from .env. Sessions will use insecure fallback.");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.warn(
        `[AUTH DEBUG] Login failed: User not found for email "${normalizedEmail}". Check ADMIN_EMAIL in .env or run "npm run admin:reset".`
      );
      // Execute dummy compare to prevent timing attack enumeration
      await bcrypt.compare(password, "$2a$12$e8vE9N6t0.q2Uq.JbW5L1.yv619kZeqtT8O9MhT20X3wK1z4E9v7C");
      return { success: false, error: "Invalid email or password." };
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordsMatch) {
      console.warn(
        `[AUTH DEBUG] Login failed: Password mismatch for user "${normalizedEmail}". Stored hash does not match entered password. Run "npm run admin:reset" if ADMIN_PASSWORD in .env was modified.`
      );
      return { success: false, error: "Invalid email or password." };
    }

    if (user.role !== UserRole.ADMIN) {
      console.warn(
        `[AUTH DEBUG] Login failed: User "${normalizedEmail}" exists but has role "${user.role}", not "ADMIN".`
      );
      return { success: false, error: "Access denied: insufficient privileges." };
    }

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    console.log(`[AUTH DEBUG] Login successful: Valid ADMIN session created for "${normalizedEmail}".`);
    return { success: true };
  } catch (error) {
    console.error("[AUTH DEBUG] Login internal failure:", error);
    return { success: false, error: "An unexpected error occurred during sign-in." };
  }
}

/**
 * Clears the session cookie.
 */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
