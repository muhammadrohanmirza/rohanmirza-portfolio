import { z } from "zod";

const urlOrPath = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//i.test(val),
    "Must be a valid URL or path"
  );

export const ProjectImageSchema = z.object({
  url: urlOrPath,
  altText: z.string().max(100).default("Project preview"),
  order: z.number().int().default(0),
});

export const ProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(120, "Slug cannot exceed 120 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  category: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable()
    .default("AI Systems"),
  categoryLabel: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable(),
  iconImageUrl: urlOrPath
    .optional()
    .nullable()
    .or(z.literal("")),
  summary: z
    .string()
    .trim()
    .min(10, "Summary must be at least 10 characters")
    .max(300, "Summary cannot exceed 300 characters"),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters"),
  featured: z.boolean().default(false),
  featuredOrder: z.number().int().default(0),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
  techStack: z
    .array(z.string().trim().min(1))
    .min(1, "Select or enter at least one technology"),
  githubUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  liveUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  images: z.array(ProjectImageSchema).default([]),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
