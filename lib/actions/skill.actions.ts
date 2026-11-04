"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "../prisma";
import { assertAdminSession } from "../auth";
import {
  SkillCategorySchema,
  SkillSchema,
  SkillCategoryInput,
  SkillInput,
} from "../validations/skill.schema";

export async function createCategory(data: SkillCategoryInput) {
  await assertAdminSession();
  const validated = SkillCategorySchema.parse(data);

  const category = await prisma.skillCategory.create({
    data: validated,
  });

  revalidateTag("portfolio:skills", "max");
  revalidatePath("/");
  revalidatePath("/admin/skills");

  return { success: true, category };
}

export async function updateCategory(id: string, data: SkillCategoryInput) {
  await assertAdminSession();
  const validated = SkillCategorySchema.parse(data);

  await prisma.skillCategory.update({
    where: { id },
    data: validated,
  });

  revalidateTag("portfolio:skills", "max");
  revalidatePath("/");
  revalidatePath("/admin/skills");

  return { success: true };
}

export async function deleteCategory(id: string) {
  await assertAdminSession();

  await prisma.skillCategory.delete({
    where: { id },
  });

  revalidateTag("portfolio:skills", "max");
  revalidatePath("/");
  revalidatePath("/admin/skills");

  return { success: true };
}

export async function reorderCategories(orderedIds: string[]) {
  await assertAdminSession();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.skillCategory.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidateTag("portfolio:skills", "max");
  revalidatePath("/");
  revalidatePath("/admin/skills");

  return { success: true };
}

export async function toggleCategoryVisibility(id: string, visible: boolean) {
  await assertAdminSession();

  await prisma.skillCategory.update({
    where: { id },
    data: { visible },
  });

  revalidateTag("portfolio:skills", "max");
  revalidatePath("/");
  revalidatePath("/admin/skills");

  return { success: true };
}

export async function createSkill(data: SkillInput) {
  await assertAdminSession();
  const validated = SkillSchema.parse(data);

  const skill = await prisma.skill.create({
    data: validated,
  });

  revalidateTag("portfolio:skills", "max");
  revalidatePath("/");
  revalidatePath("/admin/skills");

  return { success: true, skill };
}

export async function updateSkill(id: string, data: SkillInput) {
  await assertAdminSession();
  const validated = SkillSchema.parse(data);

  const skill = await prisma.skill.update({
    where: { id },
    data: validated,
  });

  revalidateTag("portfolio:skills", "max");
  revalidatePath("/");
  revalidatePath("/admin/skills");

  return { success: true, skill };
}

export async function toggleSkillVisibility(id: string, visible: boolean) {
  await assertAdminSession();

  await prisma.skill.update({
    where: { id },
    data: { visible },
  });

  revalidateTag("portfolio:skills", "max");
  revalidatePath("/");
  revalidatePath("/admin/skills");

  return { success: true };
}

export async function deleteSkill(id: string) {
  await assertAdminSession();

  await prisma.skill.delete({
    where: { id },
  });

  revalidateTag("portfolio:skills", "max");
  revalidatePath("/");
  revalidatePath("/admin/skills");

  return { success: true };
}

export async function reorderSkills(categoryId: string, orderedIds: string[]) {
  await assertAdminSession();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.skill.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidateTag("portfolio:skills", "max");
  revalidatePath("/");
  revalidatePath("/admin/skills");

  return { success: true };
}
