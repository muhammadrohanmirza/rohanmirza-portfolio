"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { assertAdminSession } from "../auth";
import {
  ContactSubmissionSchema,
  ContactSubmissionInput,
} from "../validations/message.schema";

export async function submitContactMessage(data: ContactSubmissionInput) {
  const validated = ContactSubmissionSchema.parse(data);

  // Honeypot check: If bot filled the website field, silently succeed without saving
  if (validated.website && validated.website.length > 0) {
    return { success: true, message: "Thank you! Your message has been sent." };
  }

  await prisma.contactMessage.create({
    data: {
      name: validated.name,
      email: validated.email,
      subject: validated.subject || null,
      message: validated.message,
      isRead: false,
    },
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");

  return { success: true, message: "Thank you! Your message has been sent successfully." };
}

export async function markMessageRead(id: string, isRead: boolean) {
  await assertAdminSession();

  await prisma.contactMessage.update({
    where: { id },
    data: { isRead },
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");

  return { success: true };
}

export async function deleteMessage(id: string) {
  await assertAdminSession();

  await prisma.contactMessage.delete({
    where: { id },
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");

  return { success: true };
}

export async function markAllMessagesRead() {
  await assertAdminSession();

  await prisma.contactMessage.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin");

  return { success: true };
}
