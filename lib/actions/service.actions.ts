"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "../prisma";
import { assertAdminSession } from "../auth";
import { ServiceSchema, ServiceInput } from "../validations/service.schema";

export async function createService(data: ServiceInput) {
  await assertAdminSession();
  const validated = ServiceSchema.parse(data);

  const service = await prisma.service.create({
    data: validated,
  });

  revalidateTag("portfolio:services", "max");
  revalidatePath("/");
  revalidatePath("/admin/services");

  return { success: true, service };
}

export async function updateService(id: string, data: ServiceInput) {
  await assertAdminSession();
  const validated = ServiceSchema.parse(data);

  await prisma.service.update({
    where: { id },
    data: validated,
  });

  revalidateTag("portfolio:services", "max");
  revalidatePath("/");
  revalidatePath("/admin/services");

  return { success: true };
}

export async function deleteService(id: string) {
  await assertAdminSession();

  await prisma.service.delete({
    where: { id },
  });

  revalidateTag("portfolio:services", "max");
  revalidatePath("/");
  revalidatePath("/admin/services");

  return { success: true };
}

export async function toggleServiceVisibility(id: string, visible: boolean) {
  await assertAdminSession();

  await prisma.service.update({
    where: { id },
    data: { visible },
  });

  revalidateTag("portfolio:services", "max");
  revalidatePath("/");
  revalidatePath("/admin/services");

  return { success: true };
}

export async function reorderServices(orderedIds: string[]) {
  await assertAdminSession();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.service.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidateTag("portfolio:services", "max");
  revalidatePath("/");
  revalidatePath("/admin/services");

  return { success: true };
}
