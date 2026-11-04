import { z } from "zod";

export const SkillCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(60),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const SkillSchema = z.object({
  name: z.string().trim().min(1, "Skill name is required").max(60),
  categoryId: z.string().min(1, "Category is required"),
  iconName: z.string().trim().optional().nullable(),
  proficiency: z.number().int().min(1).max(100).optional().nullable(),
  proficiencyLevel: z.string().trim().optional().nullable(),
  yearsOfExp: z.number().int().min(0).max(50).optional().nullable(),
  description: z.string().trim().max(300).optional().nullable(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export type SkillCategoryInput = z.infer<typeof SkillCategorySchema>;
export type SkillInput = z.infer<typeof SkillSchema>;
