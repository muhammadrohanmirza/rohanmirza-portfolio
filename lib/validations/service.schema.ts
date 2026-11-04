import { z } from "zod";

export const ServiceSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  iconName: z.string().trim().default("Code"),
  deliverableTag: z.string().trim().max(100).optional().nullable(),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof ServiceSchema>;
