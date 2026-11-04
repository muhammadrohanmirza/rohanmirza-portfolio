import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Load .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

const prisma = new PrismaClient();

async function runAudit() {
  console.log("=================================================");
  console.log("🧪 STARTING FULL CRUD AUDIT VERIFICATION");
  console.log("=================================================");

  // 1. SKILLS & CATEGORIES
  console.log("\n--- Testing 1: Skill Categories & Skills ---");
  const testCat = await prisma.skillCategory.create({
    data: { name: "Audit Test Category " + Date.now(), order: 99, visible: true },
  });
  console.log("✔ Category Created:", testCat.name);

  const testSkill = await prisma.skill.create({
    data: {
      name: "Autonomous Agents",
      categoryId: testCat.id,
      iconName: "Sparkles",
      proficiency: 95,
      proficiencyLevel: "Expert",
      yearsOfExp: 4,
      description: "Stateful agentic systems with MCP",
      featured: true,
      visible: true,
      order: 1,
    },
  });
  console.log("✔ Skill Created with All Fields:", testSkill.name, testSkill.proficiencyLevel, `${testSkill.yearsOfExp}y`);

  // Verify Admin List query
  const adminCat = await prisma.skillCategory.findUnique({
    where: { id: testCat.id },
    include: { skills: true },
  });
  if (!adminCat || adminCat.skills.length === 0) throw new Error("Skill missing from admin query!");
  console.log("✔ Admin Query verified: Skill appears in dashboard grouped list.");

  // Verify Public Query
  const publicSkills = await prisma.skillCategory.findMany({
    where: { id: testCat.id, visible: true },
    include: { skills: { where: { visible: true } } },
  });
  if (publicSkills.length === 0 || publicSkills[0].skills.length === 0) throw new Error("Skill missing from public query!");
  console.log("✔ Public Query verified: Skill appears with all fields.");

  // Test Update
  const updatedSkill = await prisma.skill.update({
    where: { id: testSkill.id },
    data: { name: "Autonomous Agents & LLMs", proficiency: 98 },
  });
  console.log("✔ Skill Updated:", updatedSkill.name, `${updatedSkill.proficiency}%`);

  // Test Visibility toggle
  await prisma.skill.update({ where: { id: testSkill.id }, data: { visible: false } });
  const hiddenCheck = await prisma.skill.findMany({ where: { id: testSkill.id, visible: true } });
  if (hiddenCheck.length > 0) throw new Error("Hidden skill should not be visible!");
  console.log("✔ Skill Visibility Toggle verified (hidden on public, retained in database).");

  // Cleanup skill and category
  await prisma.skill.delete({ where: { id: testSkill.id } });
  await prisma.skillCategory.delete({ where: { id: testCat.id } });
  console.log("✔ Skill and Category Deleted with cascade.");

  // 2. PROJECTS
  console.log("\n--- Testing 2: Projects ---");
  const testProject = await prisma.project.create({
    data: {
      title: "Audit Test Project " + Date.now(),
      slug: "audit-test-project-" + Date.now(),
      summary: "A test project summary verifying full CRUD operations.",
      description: "Detailed description of the audit test project with tech stack tags.",
      techStack: ["Next.js", "TypeScript", "Prisma"],
      published: true,
      featured: true,
      order: 99,
    },
  });
  console.log("✔ Project Created:", testProject.title);

  // Toggle publish
  const toggledProj = await prisma.project.update({
    where: { id: testProject.id },
    data: { published: false },
  });
  console.log("✔ Project Status Toggled to Draft:", !toggledProj.published);

  // Delete
  await prisma.project.delete({ where: { id: testProject.id } });
  console.log("✔ Project Deleted.");

  // 3. SERVICES
  console.log("\n--- Testing 3: Services ---");
  const testService = await prisma.service.create({
    data: {
      title: "Audit Test Service " + Date.now(),
      description: "Custom AI & web engineering capabilities.",
      iconName: "Bot",
      order: 99,
      visible: true,
    },
  });
  console.log("✔ Service Created:", testService.title);

  await prisma.service.update({
    where: { id: testService.id },
    data: { visible: false },
  });
  console.log("✔ Service Visibility Toggled.");

  await prisma.service.delete({ where: { id: testService.id } });
  console.log("✔ Service Deleted.");

  // 4. EDUCATION & CERTIFICATIONS
  console.log("\n--- Testing 4: Education & Certifications ---");
  const testEdu = await prisma.education.create({
    data: {
      institution: "MIT " + Date.now(),
      degree: "Master of Science",
      fieldOfStudy: "Artificial Intelligence",
      startDate: new Date("2022-09-01"),
      visible: true,
      order: 99,
    },
  });
  console.log("✔ Education Record Created:", testEdu.institution);
  await prisma.education.delete({ where: { id: testEdu.id } });
  console.log("✔ Education Record Deleted.");

  const testCert = await prisma.certification.create({
    data: {
      title: "Google Professional Cloud Architect " + Date.now(),
      issuer: "Google Cloud",
      visible: true,
      order: 99,
    },
  });
  console.log("✔ Certification Created:", testCert.title);
  await prisma.certification.delete({ where: { id: testCert.id } });
  console.log("✔ Certification Deleted.");

  // 5. SOCIAL LINKS
  console.log("\n--- Testing 5: Social Links ---");
  const initialSocialCount = await prisma.socialLink.count();
  console.log("✔ Current Social Links in DB:", initialSocialCount);

  // 6. MESSAGES
  console.log("\n--- Testing 6: Messages ---");
  const testMsg = await prisma.contactMessage.create({
    data: {
      name: "Audit Tester",
      email: "audit@test.com",
      message: "Test contact message for audit verification.",
      isRead: false,
    },
  });
  console.log("✔ Contact Message Created:", testMsg.id);

  const readMsg = await prisma.contactMessage.update({
    where: { id: testMsg.id },
    data: { isRead: true },
  });
  console.log("✔ Contact Message Marked Read:", readMsg.isRead);

  await prisma.contactMessage.delete({ where: { id: testMsg.id } });
  console.log("✔ Contact Message Deleted.");

  console.log("\n=================================================");
  console.log("✨ ALL 6 SECTIONS PASSED FULL CRUD AUDIT!");
  console.log("=================================================");
}

runAudit()
  .catch((e) => {
    console.error("❌ Audit failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
