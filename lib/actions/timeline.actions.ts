"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "../prisma";
import { assertAdminSession } from "../auth";
import {
  EducationSchema,
  CertificationSchema,
  EducationInput,
  CertificationInput,
} from "../validations/timeline.schema";

export async function createEducation(data: EducationInput) {
  await assertAdminSession();
  const validated = EducationSchema.parse(data);

  const education = await prisma.education.create({
    data: {
      ...validated,
      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : null,
    },
  });

  revalidateTag("portfolio:education", "max");
  revalidatePath("/");
  revalidatePath("/admin/education");

  return { success: true, education };
}

export async function updateEducation(id: string, data: EducationInput) {
  await assertAdminSession();
  const validated = EducationSchema.parse(data);

  await prisma.education.update({
    where: { id },
    data: {
      ...validated,
      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : null,
    },
  });

  revalidateTag("portfolio:education", "max");
  revalidatePath("/");
  revalidatePath("/admin/education");

  return { success: true };
}

export async function deleteEducation(id: string) {
  await assertAdminSession();

  await prisma.education.delete({
    where: { id },
  });

  revalidateTag("portfolio:education", "max");
  revalidatePath("/");
  revalidatePath("/admin/education");

  return { success: true };
}

export async function toggleEducationVisibility(id: string, visible: boolean) {
  await assertAdminSession();

  await prisma.education.update({
    where: { id },
    data: { visible },
  });

  revalidateTag("portfolio:education", "max");
  revalidatePath("/");
  revalidatePath("/admin/education");

  return { success: true };
}

export async function reorderEducation(orderedIds: string[]) {
  await assertAdminSession();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.education.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidateTag("portfolio:education", "max");
  revalidatePath("/");
  revalidatePath("/admin/education");

  return { success: true };
}

export async function createCertification(data: CertificationInput) {
  await assertAdminSession();
  const validated = CertificationSchema.parse(data);

  const certification = await prisma.certification.create({
    data: {
      ...validated,
      issueDate: validated.issueDate ? new Date(validated.issueDate) : null,
      expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
      credentialUrl: validated.credentialUrl || null,
      certificateUrl: validated.certificateUrl || null,
    },
  });

  revalidateTag("portfolio:education", "max");
  revalidatePath("/");
  revalidatePath("/admin/education");

  return { success: true, certification };
}

export async function updateCertification(id: string, data: CertificationInput) {
  await assertAdminSession();
  const validated = CertificationSchema.parse(data);

  const certification = await prisma.certification.update({
    where: { id },
    data: {
      ...validated,
      issueDate: validated.issueDate ? new Date(validated.issueDate) : null,
      expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
      credentialUrl: validated.credentialUrl || null,
      certificateUrl: validated.certificateUrl || null,
    },
  });

  revalidateTag("portfolio:education", "max");
  revalidatePath("/");
  revalidatePath("/admin/education");

  return { success: true, certification };
}

export async function toggleCertificationVisibility(id: string, visible: boolean) {
  await assertAdminSession();

  await prisma.certification.update({
    where: { id },
    data: { visible },
  });

  revalidateTag("portfolio:education", "max");
  revalidatePath("/");
  revalidatePath("/admin/education");

  return { success: true };
}

export async function reorderCertifications(orderedIds: string[]) {
  await assertAdminSession();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.certification.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidateTag("portfolio:education", "max");
  revalidatePath("/");
  revalidatePath("/admin/education");

  return { success: true };
}

export async function deleteCertification(id: string) {
  await assertAdminSession();

  await prisma.certification.delete({
    where: { id },
  });

  revalidateTag("portfolio:education", "max");
  revalidatePath("/");
  revalidatePath("/admin/education");

  return { success: true };
}
