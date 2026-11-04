import { z } from "zod";

export const ContactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email address")
    .max(255, "Email is too long"),
  subject: z
    .string()
    .trim()
    .max(150, "Subject cannot exceed 150 characters")
    .optional()
    .nullable(),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(3000, "Message cannot exceed 3000 characters"),
  // Honeypot field - must be empty string or undefined
  website: z.string().optional().nullable(),
});

export type ContactSubmissionInput = z.infer<typeof ContactSubmissionSchema>;
