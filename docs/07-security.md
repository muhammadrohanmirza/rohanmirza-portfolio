# 07 - Threat Modeling & Security Architecture
**Project:** Rohan.Dev Personal Portfolio & Admin CMS  
**Role / Persona:** Full Stack Developer & AI Engineer  
**Date:** October 2026  
**Status:** Planning (Phase 0)

---

## 1. Threat Model & Asset Inventory

The security architecture protects against unauthorized content tampering, credential theft, denial of service, data leakage, and malicious file injection.

### Critical Assets:
1. **Administrative Access**: Full write capability over public site content and settings.
2. **Database Credentials**: Direct access to Neon PostgreSQL.
3. **Contact Inquiries**: Visitor communication, names, and email addresses stored in the database.
4. **Cloudinary Asset Storage**: Cloud storage account and API secrets.
5. **Public Integrity**: Preventing XSS, defacement, or exposure of unpublished drafts.

---

## 2. Attack Vectors & Mitigations Matrix

| Attack Vector | Threat Level | Mitigation Strategy |
| :--- | :--- | :--- |
| **Credential Brute-Forcing** | High | Rate limiting on `/api/auth/*` (max 5 failed attempts/15 min), generic error messages, bcryptjs cost 12, account lockout policy. |
| **Bypass of Admin UI** | Critical | Server-side authorization check in **every** Server Action and Route Handler via `assertAdminSession()`. UI visibility is never trusted. |
| **Unpublished Data Leakage** | High | Public queries (`getPublicProjects()`, etc.) explicitly enforce `WHERE published = true` and `visible = true` in Prisma SQL queries. Client never receives draft models. |
| **Contact Form Spam & Flooding** | Medium | Hidden Honeypot field, strict IP-based rate limiting (3 submissions/hour), minimum and maximum text length rules, IP hashing for audit. |
| **Malicious File Uploads** | High | Client uploads directly to Cloudinary using server-generated short-lived HMAC signatures. Server never runs arbitrary file parsers. File types restricted strictly to `image/jpeg`, `image/png`, `image/webp`, and `application/pdf` for resumes. Max file size: 5MB for images, 10MB for PDFs. |
| **Cross-Site Scripting (XSS)** | High | React 19 automatic JSX string escaping; strict HTML sanitization on any rich text rendering; Content Security Policy (CSP) headers forbidding unauthorized inline execution. |
| **Cross-Site Request Forgery (CSRF)** | Medium | Auth.js built-in CSRF token validation; SameSite=Lax/Strict cookie configuration; Server Actions automatic origin header verification. |
| **SQL Injection** | Critical | 100% parameterized queries via Prisma ORM. Raw unsanitized SQL strings are strictly prohibited. |
| **Secret Exposure** | Critical | Strict environment separation: `DATABASE_URL`, `NEXTAUTH_SECRET`, `CLOUDINARY_API_SECRET`, `ADMIN_PASSWORD` are exclusively accessed in server-only modules (`import 'server-only'`). Only non-sensitive variables are prefixed with `NEXT_PUBLIC_`. |
| **Insecure Initial Setup** | Critical | Zero default credentials. Seed command requires pre-defined environment variables. Setup permanently locks once an admin user exists. |

---

## 3. Input Validation & Data Sanitization Specification

All input is validated on the server using **Zod**. The server never trusts client-validated payloads.

### 3.1 Contact Message Schema
```typescript
export const ContactSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().trim().email("Please provide a valid email address").max(255),
  subject: z.string().trim().max(150).optional().nullable(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000, "Message cannot exceed 3000 characters"),
  website: z.string().max(0, "Spam detected").optional() // Honeypot must be empty
});
```

### 3.2 Project Management Schema
```typescript
export const ProjectSchema = z.object({
  title: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase alphanumeric characters and hyphens").max(120),
  summary: z.string().trim().min(10).max(300),
  description: z.string().trim().min(20).max(10000),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  techStack: z.array(z.string().trim().min(1).max(50)).min(1, "Select at least one technology"),
  githubUrl: z.string().trim().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  liveUrl: z.string().trim().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  images: z.array(z.object({
    url: z.string().url(),
    altText: z.string().max(100).default("Project screenshot"),
    order: z.number().int().default(0)
  })).default([])
});
```

---

## 4. HTTP Security Headers

Configured in `next.config.ts` or `middleware.ts`:

```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  }
];
```

---

## 5. Rate Limiting Architecture

The rate limiter runs at the application edge or within API route handlers:
- **Storage**: In-memory token bucket / LRU cache with IP window tracking.
- **Rules**:
  - `/api/auth/callback/credentials`: 5 requests per 15 minutes per IP.
  - `/api/contact`: 3 submissions per hour per IP.
  - `/api/uploads/sign`: 30 signatures per hour per authenticated session.
- **Headers Returned**:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
