"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "../prisma";
import { assertAdminSession } from "../auth";
import { KeyStatSchema, KeyStatInput } from "../validations/stat.schema";

export async function createKeyStat(data: KeyStatInput) {
  await assertAdminSession();
  const validated = KeyStatSchema.parse(data);

  // Auto assign highest order if 0
  const maxOrder = await prisma.keyStat.aggregate({
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const stat = await prisma.keyStat.create({
    data: {
      ...validated,
      order: validated.order || nextOrder,
    },
  });

  revalidateTag("portfolio:stats", "max");
  revalidatePath("/");
  revalidatePath("/admin/stats");
  return { success: true, stat };
}

export async function updateKeyStat(id: string, data: KeyStatInput) {
  await assertAdminSession();
  const validated = KeyStatSchema.parse(data);

  const stat = await prisma.keyStat.update({
    where: { id },
    data: validated,
  });

  revalidateTag("portfolio:stats", "max");
  revalidatePath("/");
  revalidatePath("/admin/stats");
  return { success: true, stat };
}

export async function deleteKeyStat(id: string) {
  await assertAdminSession();
  await prisma.keyStat.delete({ where: { id } });

  revalidateTag("portfolio:stats", "max");
  revalidatePath("/");
  revalidatePath("/admin/stats");
  return { success: true };
}

export async function toggleKeyStatVisibility(id: string, visible: boolean) {
  await assertAdminSession();
  await prisma.keyStat.update({
    where: { id },
    data: { visible },
  });

  revalidateTag("portfolio:stats", "max");
  revalidatePath("/");
  revalidatePath("/admin/stats");
  return { success: true };
}

export async function reorderKeyStats(orderedIds: string[]) {
  await assertAdminSession();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.keyStat.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidateTag("portfolio:stats", "max");
  revalidatePath("/");
  revalidatePath("/admin/stats");
  return { success: true };
}
