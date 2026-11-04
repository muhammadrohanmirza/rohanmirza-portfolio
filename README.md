# Rohan.Dev

Rohan.Dev is a personal portfolio website with a database-backed admin dashboard (CMS) built in Next.js.

Live site: TBD — fill in after deployment.

---

## 1. Features

### Public site

- Hero section with typewriter text and optional 3D background toggle
- About section with profile photo, bio, location, availability status, and resume link
- Tech stack and skill categories
- Featured projects with categories and project detail views
- Services section
- Education and certifications timeline
- “Let’s Work Together” callout card
- Contact popup form with server-side email notification via Resend
- Footer with site settings and social links
- Light, dark, and system theme support

### Admin dashboard (CMS)

The protected dashboard in `/admin` includes:

- Overview dashboard with charts and recent inquiries
- Profile and bio management
- Projects management
- Skills and category management
- Services management
- Education and certifications management
- Homepage content and section visibility controls
- Messages and inquiries inbox
- SEO and metadata management
- Theme and accent configuration
- Site settings and social links
- Key stats for the About section
- Image upload support and authentication

---

## 2. Tech stack

This project is configured with the following real versions and packages:

- Next.js: 16.4.0
- React: 19.3.0
- TypeScript: 5
- Tailwind CSS: 4
- Framer Motion: 14.1.0
- Three.js: 0.186.1
- Prisma: 6.4.1
- PostgreSQL: Neon-hosted PostgreSQL
- Resend: 6.32.1
- Cloudinary: signed direct uploads and URL fallback
- Auth approach: custom JWT session authentication using `jose` and `bcryptjs` with HTTP-only cookies, not a NextAuth.js setup

---

## 3. Prerequisites

- Node.js 20 LTS or newer (Next.js 16 requirement; this repo does not declare an `engines` field)
- Git
- A Neon account
- Optional: a Resend account
- Optional: a Cloudinary account

---

## 4. Quick start

These commands are Windows-friendly for both PowerShell and CMD.

```powershell
# PowerShell
git clone <your-repo-url>
cd my-portfolio
npm install
Copy-Item .env.example .env
```

```cmd
REM CMD
git clone <your-repo-url>
cd my-portfolio
npm install
copy .env.example .env
```

Then fill in the values in `.env` before running Prisma.

### Create the database tables

This project includes both Prisma schema push and migration commands.

```cmd
npm run db:generate
npm run db:push
```

Use `npm run db:push` for the simplest local setup. It pushes the current Prisma schema to PostgreSQL without creating migration files. Use `npm run db:migrate` when you want the migration workflow instead:

```cmd
npm run db:migrate
```

`db:migrate` creates and applies migrations; `db:push` is faster for local schema sync and for this setup guide.

### Seed the first admin user

```cmd
npm run db:seed
```

This script runs the same seed logic as `npm run admin:init` and creates the first admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` if no admin already exists.

### Start the app

```cmd
npm run dev
```

Then open:

- http://localhost:3000
- http://localhost:3000/admin

---

## 5. Environment variables

The project reads variables from `.env.example` and the runtime code. Do not commit or share your `.env` file.

| Variable | Required | Where to get it | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Neon project connection details | Use the pooled connection string. This is the main app database URL. |
| `DIRECT_URL` | Yes | Neon project connection details | Use the direct connection string. Prisma CLI and migrations use this value. |
| `NEXTAUTH_SECRET` | Yes | Generate locally | Required for secure session signing. Use a 32+ character random value. |
| `AUTH_SECRET` | Yes | Generate locally | The app checks `AUTH_SECRET` or `NEXTAUTH_SECRET` in `lib/auth.ts`. This is the active secret used by the custom JWT session code. |
| `NEXTAUTH_URL` | Yes for deployment and local app URL | Your local or deployed site URL | In `.env.example`, this is set to `http://localhost:3000`. Use the live site URL in production. |
| `ADMIN_EMAIL` | Yes | Choose a real admin email | This is the first admin account email used by the seed script. |
| `ADMIN_PASSWORD` | Yes | Choose a strong password | Used by the seed script and reset utility. Keep it unique and secure. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary dashboard | Needed only if you want Cloudinary uploads enabled. |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary dashboard | Needed only for signed Cloudinary uploads. |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary dashboard | Needed only for signed Cloudinary uploads. |
| `RESEND_API_KEY` | Optional | Resend dashboard | Required to send contact-form email notifications. |
| `CONTACT_TO_EMAIL` | Optional but recommended | Your personal inbox | This is the address the contact form sends messages to. |
| `CONTACT_FROM_EMAIL` | Optional but recommended | Resend sender address | In free Resend test mode, this sender can only deliver to the email registered to the Resend account. |

### Generate a secret

```powershell
# PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```cmd
REM CMD
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Notes

- Resend test senders can only deliver to the email associated with the Resend account. This is how the project is configured in `.env.example`.
- Cloudinary is optional because the uploader supports direct image URLs in addition to Cloudinary uploads.
- `.env` must never be committed to Git or shared publicly.

---

## 6. Admin dashboard guide

### Log in

Open `/login` and sign in with:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

After a successful login, the app creates a JWT-based admin session in an HTTP-only cookie and redirects you to `/admin`.

### Create or reset the admin account

This project includes the real reset script:

```cmd
npm run admin:reset
```

That script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`, updates the admin user if present, or creates one if no admin exists. The seed script locks after the first admin record is created.

### Admin pages and what they control

| Page | What it controls | Public section affected |
| --- | --- | --- |
| `/admin` | Overview metrics, charts, recent inquiries | None; dashboard analytics only |
| `/admin/profile` | Name, title, bio, avatar, about image, location, availability, resume | Hero and About sections |
| `/admin/homepage` | Hero text, CTAs, typewriter settings, section visibility | Hero, About, Skills, Projects, Services, Timeline, Contact |
| `/admin/projects` | Project records, summaries, galleries, status, links | Featured Projects section and project detail content |
| `/admin/skills` | Skill categories and skills | Tech stack / skills section |
| `/admin/services` | Services and capability cards | Services section |
| `/admin/education` | Education history and certifications | Education / Certification timeline |
| `/admin/messages` | Contact messages received from the site | Contact submissions only |
| `/admin/seo` | Meta title, description, keywords, social share card | SEO metadata and social previews |
| `/admin/theme` | Default theme mode and accent styling | Light/dark/system theme and accent colors |
| `/admin/settings` | Contact email, phone, social links, footer text | Footer, contact info, social links |
| `/admin/stats` | Key statistics displayed in the About section | About section highlight stats |

Changes appear on the public site immediately after saving.

---

## 7. Content checklist after first login

After the first admin login, complete these items before publishing:

- Fill in the profile: name, title, bio, location, resume URL, and availability text
- Add the hero image and About image
- Upload a resume PDF if needed
- Add social links
- Set the hero text and typewriter phrases
- Create at least a few projects
- Add skill categories and related skills
- Add services
- Add education and certifications
- Review SEO title, description, and keywords
- Fill in the phone number, email address, and location in the site settings

---

## 8. Project structure

```text
my-portfolio/
├─ app/                          # App Router pages and route handlers
│  ├─ admin/                    # Protected CMS pages and dashboard routes
│  ├─ api/                      # Contact and upload endpoints
│  ├─ login/                    # Admin login screen
│  ├─ projects/                 # Public project listing and detail routes
│  ├─ uploads/                  # Upload route handlers
│  ├─ globals.css               # Global styles
│  ├─ layout.tsx                # Root app layout
│  ├─ page.tsx                  # Home page
│  └─ ...                       # Other app routes
├─ components/                  # Reusable UI and app-specific sections
│  ├─ admin/                    # CMS UI, forms, tables, and charts
│  ├─ public/                   # Public portfolio sections and modals
│  └─ ui/                       # Shared primitives
├─ lib/                         # Auth, Prisma, Cloudinary, validations, and queries
│  ├─ actions/                  # Server actions for content updates
│  ├─ queries/                  # Public/admin database queries
│  ├─ validations/              # Zod validation schemas
│  ├─ auth.ts                   # Custom JWT auth logic
│  ├─ cloudinary.ts             # Cloudinary signing and cleanup helpers
│  ├─ prisma.ts                 # Prisma client instance
│  ├─ rate-limiter.ts           # Login/contact rate limiting
│  └─ utils.ts                  # Shared utilities
├─ prisma/                      # Prisma schema, seed, and migrations
│  ├─ migrations/               # Database migration history
│  ├─ schema.prisma             # Database schema
│  └─ seed.ts                   # Initial seed data and admin creation
├─ public/                      # Static files and uploaded assets
│  └─ uploads/                  # Local upload storage
├─ scripts/                     # Admin reset and audit scripts
├─ docs/                        # Architecture, schema, auth, and audit docs
├─ .env.example                 # Environment variable template
├─ next.config.ts               # Next.js config
├─ package.json                 # Project scripts and dependencies
├─ proxy.ts                     # Local dev proxy helper
├─ tsconfig.json                # TypeScript config
├─ README.md                    # Project documentation
├─ eslint.config.mjs            # ESLint config
├─ next-env.d.ts               # Next.js TypeScript declarations
├─ .gitignore                   # Git ignore file
└─ package-lock.json            # Lock file
```

---

## 9. Available scripts

These are the scripts defined in `package.json`:

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the Next.js dev server. |
| `npm run build` | Builds the production app. |
| `npm run start` | Runs the production build locally. |
| `npm run lint` | Runs ESLint on the project. |
| `npm run db:generate` | Generates the Prisma client from `schema.prisma`. |
| `npm run db:push` | Pushes the current Prisma schema to the database. |
| `npm run db:migrate` | Runs Prisma migration development workflow. |
| `npm run db:seed` | Seeds initial content and creates the first admin if absent. |
| `npm run admin:init` | Alias for the seed script. |
| `npm run admin:reset` | Resets or creates the admin account using `.env` values. |
| `npm run test:responsive` | Runs the responsive auditing script. |

---

## 10. Deployment (Vercel + Neon)

1. Push the repo to GitHub without committing `.env`.
2. Import the repository into Vercel.
3. Add all environment variables from `.env.example` in the Vercel dashboard.
4. Use the prod database: `DATABASE_URL` and `DIRECT_URL` from Neon.
5. Set the app URL in the environment as `NEXTAUTH_URL` and the correct production domain in Vercel.
6. Run the database setup against production once:

```cmd
npm run db:generate
npm run db:push
```

If you prefer Prisma migrations, use:

```cmd
npm run db:migrate
```

7. Verify the Resend sender configuration. Use a verified sender or a Resend test sender that is allowed by your account.
8. Deploy the project.

### Post-deploy checklist

- Log in to `/admin` with the admin account
- Create and publish a project
- Submit the contact form and verify the email is sent
- Confirm the default theme is applied
- Test the mobile menu on a narrow viewport
- Verify SEO tags and metadata render correctly

---

## 11. Security notes

- Administrative authorization is checked server-side before writes and route access
- Input validation is enforced with Zod schemas
- The contact route includes rate limiting and a honeypot field
- Login attempts are rate-limited by IP
- Secrets live only in environment variables; do not hardcode them in code
- `.env` must never be committed or shared
- Change the admin password after deployment and keep it separate from source control

---

## 12. Troubleshooting

### Cannot log in

- The seed script locks after the first admin account is created.
- If you modify `ADMIN_EMAIL` or `ADMIN_PASSWORD` in `.env`, restart the server before testing again.
- Make sure `AUTH_SECRET` is present. Without it, the app warns that sessions will fall back to an insecure dev secret.
- If the password changed, reset the admin with:

```cmd
npm run admin:reset
```

### Resend email not arriving

- Confirm `RESEND_API_KEY` is set
- Confirm `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` are valid
- In Resend test mode, the sender can only deliver to the email registered to the Resend account
- Check spam folders and the Resend dashboard activity log

### Theme default not applying

- Clear browser local storage for the site, then reload
- If the theme still does not match, check the `ThemeSettings` row in the database and the admin theme page

### Changes not showing on the public site

- Use a hard refresh with Ctrl+Shift+R
- Rebuild the production app and run it locally if needed:

```cmd
npm run build
npm run start
```

### Database connection errors

- Use the pooled `DATABASE_URL` for app runtime and the direct `DIRECT_URL` for Prisma CLI and migrations
- Confirm the Neon project is active and the connection strings are correct

### Cloudinary upload warning

- This warning is expected if Cloudinary credentials are missing
- The uploader supports a direct image URL fallback, so you can still add images without Cloudinary

### Port 3000 is already in use

Use a different port in PowerShell or CMD:

```powershell
# PowerShell
$env:PORT = 3001
npm run dev
```

```cmd
REM CMD
set PORT=3001
npm run dev
```

---

## 13. License / credits

License: TBD. Add your preferred license and credit details here.

---

## 14. Screenshots

<!-- Add screenshots here later -->

"# rohanmirza-portfolio" 
