import { z } from "zod";

export const KeyStatSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(60),
  value: z.string().trim().min(1, "Value is required").max(30),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export type KeyStatInput = z.infer<typeof KeyStatSchema>;
