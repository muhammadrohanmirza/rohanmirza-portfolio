import fs from "fs";
import path from "path";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

// Load environment variables from .env if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnv();

const prisma = new PrismaClient();

async function resetAdmin() {
  console.log("=================================================");
  console.log("🔐 Rohan.Dev Admin Credentials Reset Utility");
  console.log("=================================================");

  const rawEmail = process.env.ADMIN_EMAIL || "admin@rohan.dev";
  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!rawPassword || rawPassword.trim().length === 0) {
    console.error("❌ ERROR: ADMIN_PASSWORD is missing or empty in .env.");
    console.error("   Please define ADMIN_PASSWORD in your .env file and run this command again.");
    process.exit(1);
  }

  // Trim and lowercase the email
  const normalizedEmail = rawEmail.trim().toLowerCase();
  const password = rawPassword; // NEVER print to console

  console.log(`📧 Target Admin Email: ${normalizedEmail}`);
  console.log("⏳ Hashing password with bcrypt (cost factor: 12)...");

  const passwordHash = await bcrypt.hash(password, 12);

  // Check if an admin or user with this email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { role: UserRole.ADMIN },
        { email: normalizedEmail },
      ],
    },
  });

  if (existingUser) {
    console.log(`🔄 Existing account identified (ID: ${existingUser.id}). Updating credentials...`);
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        email: normalizedEmail,
        passwordHash,
        role: UserRole.ADMIN,
      },
    });
    console.log(`✅ SUCCESS: Admin user "${updated.email}" credentials updated successfully!`);
  } else {
    console.log("👤 No existing admin found. Creating new admin user...");
    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: "Rohan",
        passwordHash,
        role: UserRole.ADMIN,
      },
    });
    console.log(`✅ SUCCESS: Admin user "${created.email}" created successfully!`);
  }

  console.log("=================================================");
  console.log("👉 You can now log in at /login with:");
  console.log(`   Email: ${normalizedEmail}`);
  console.log("   Password: (The value configured in your .env file)");
  console.log("=================================================");
}

resetAdmin()
  .catch((error) => {
    console.error("❌ An unexpected error occurred while resetting admin credentials:", error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
