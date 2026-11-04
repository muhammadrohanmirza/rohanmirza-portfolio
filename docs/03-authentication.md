# 03 - Authentication & Authorization Architecture
**Project:** Rohan.Dev Personal Portfolio & Admin CMS  
**Role / Persona:** Full Stack Developer & AI Engineer  
**Date:** October 2026  
**Status:** Planning (Phase 0)

---

## 1. Authentication Strategy

The authentication model protects the `/admin` dashboard and all content-altering operations. It is designed around the principle of **defense-in-depth**:

1. **Framework**: NextAuth.js (Auth.js v5 / JWT Session Strategy).
2. **Session Persistence**: Encrypted, HTTP-only, SameSite=Lax, Secure cookie (no localStorage or accessible browser memory).
3. **Password Security**: Passwords hashed with `bcryptjs` using a minimum salt cost factor of 12.
4. **Token Expiry**: Strict session expiration (e.g., 24 hours), with automatic logout upon expiration.
5. **Session Revocation**: Invalidation on logout by clearing the authentication cookie and triggering client-side cache cleanup.

```
+---------------------------------------------------------------------------------------+
|                                    Login Workflow                                     |
+---------------------------------------------------------------------------------------+
  Admin visits /login
          |
          v
  Submits Credentials (email, password)
          |
          v
  NextAuth Credentials Provider
          |
          +---> Rate Limiter Check (Max 5 attempts / 15 minutes per IP)
          |     [If exceeded -> Return 429 Too Many Requests]
          |
          +---> Look up User in Neon PostgreSQL via Prisma
          |     [If not found -> Return generic "Invalid email or password"]
          |
          +---> bcrypt.compare(password, user.passwordHash)
          |     [If mismatch -> Log failed attempt, return generic error]
          |
          +---> Success:
                - Create Signed JWT containing { id, email, role: 'ADMIN' }
                - Set HTTP-only, Secure, SameSite=Lax session cookie
                - Redirect admin to /admin
```

---

## 2. Multi-Layer Route Protection

Security is enforced at three distinct layers:

### Layer 1: Edge / Next.js Middleware (`middleware.ts`)
* Inspects incoming requests matching `/admin/:path*` and `/api/admin/:path*`.
* Decodes and validates the NextAuth session token before the route or Server Component runs.
* If invalid or missing, unauthenticated requests to `/admin/*` are redirected to `/login?callbackUrl=/admin`.
* API requests without a valid session token receive an immediate `401 Unauthorized` JSON response.

### Layer 2: Server Component Layout Check (`app/admin/layout.tsx`)
* Calls `await auth()` at the root of the admin layout.
* Guarantees that even if middleware is bypassed or reconfigured, the React server rendering pipeline terminates before rendering any administrative data or child components.
* Redirects immediately if the user is unauthenticated or not an `ADMIN`.

### Layer 3: Server Action / Handler Authorization (`lib/actions/*.ts`)
* UI visibility is **never** relied upon for security.
* **Every single Server Action** (e.g., `createProject`, `updateSettings`, `deleteMessage`) executes an `assertAdminSession()` guard as its first line of code:
  ```typescript
  export async function assertAdminSession() {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      throw new Error("Unauthorized: Administrative privileges required.");
    }
    return session.user;
  }
  ```
* Unauthorized mutations throw an error and abort database transactions immediately.

---

## 3. Initial Admin Setup & Zero-Hardcoded Credentials

Hardcoded credentials or default passwords (e.g., `admin@admin.com` / `password123`) are **strictly prohibited**.

### Provisioning Mechanism: Controlled Environment Seed
Initial provisioning is conducted via `npm run db:seed` or a dedicated setup CLI `npm run admin:init`:
1. Reads environment variables:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
2. Validates complexity with Zod:
   - Email format
   - Password minimum length 10, requiring uppercase, lowercase, numbers, and symbols
3. Queries `User` count in the database:
   - If an admin user already exists, the script halts and outputs:  
     `[SETUP LOCKED]: Admin user already exists. Initial setup is permanently locked.`
4. If no admin user exists:
   - Hashes `ADMIN_PASSWORD` with `bcryptjs.hash(password, 12)`
   - Creates the single root `ADMIN` user record
   - Creates all initial database schema records with clean, valid placeholder defaults
   - Outputs: `[SUCCESS]: Admin account successfully initialized for <ADMIN_EMAIL>.`

### Password Reset & Recovery
- Since there is no public user registration, password updates are performed via:
  1. The authenticated `/admin/profile` settings page (requires current password confirmation).
  2. A protected server script (`npm run admin:reset-password`) executed by the server owner with direct console access.

---

## 4. Brute Force Mitigation & Rate Limiting

1. **Login Endpoint Rate Limiting**:
   - In-memory token bucket / sliding window rate limiter keyed by client IP and email hash.
   - Limit: 5 failed attempts within a 15-minute window.
   - Exceeding the threshold locks attempts from that IP for 30 minutes.
2. **Timing Attack Protection**:
   - Generic response for all authentication failures: `"Invalid email or password"`.
   - Consistent hashing execution even when the user record is not found (dummy hash comparison) to prevent timing discrepancy enumeration.
3. **Session Cookie Attributes**:
   - `name`: `__Secure-authjs.session-token` (in production)
   - `httpOnly`: `true`
   - `secure`: `true` (HTTPS only)
   - `sameSite`: `'lax'`
   - `path`: `'/'`
