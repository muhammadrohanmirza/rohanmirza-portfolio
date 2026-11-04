import { z } from "zod";

export const EducationSchema = z.object({
  institution: z.string().trim().min(2, "Institution is required").max(120),
  degree: z.string().trim().min(2, "Degree is required").max(120),
  fieldOfStudy: z.string().trim().max(120).optional().nullable(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
});

const urlOrPath = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//i.test(val),
    "Must be a valid URL or path"
  );

export const CertificationSchema = z.object({
  title: z.string().trim().min(2, "Certification title is required").max(120),
  issuer: z.string().trim().min(2, "Issuer is required").max(120),
  issueDate: z.string().or(z.date()).optional().nullable(),
  expiryDate: z.string().or(z.date()).optional().nullable(),
  credentialId: z.string().trim().optional().nullable(),
  credentialUrl: urlOrPath.optional().nullable().or(z.literal("")),
  certificateUrl: urlOrPath.optional().nullable().or(z.literal("")),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type EducationInput = z.infer<typeof EducationSchema>;
export type CertificationInput = z.infer<typeof CertificationSchema>;
