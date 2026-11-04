"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "../prisma";
import { assertAdminSession } from "../auth";
import { ProjectSchema, ProjectInput } from "../validations/project.schema";

export async function createProject(data: ProjectInput) {
  await assertAdminSession();
  const validated = ProjectSchema.parse(data);

  // Check slug uniqueness
  const existing = await prisma.project.findUnique({
    where: { slug: validated.slug },
  });
  if (existing) {
    throw new Error(`A project with slug "${validated.slug}" already exists.`);
  }

  const { images, ...projectData } = validated;

  const project = await prisma.project.create({
    data: {
      ...projectData,
      githubUrl: projectData.githubUrl || null,
      liveUrl: projectData.liveUrl || null,
      images: {
        create: images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || "Project preview",
          order: img.order ?? idx,
        })),
      },
    },
    include: {
      images: true,
    },
  });

  revalidateTag("portfolio:projects", "max");
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");

  return { success: true, project };
}

export async function updateProject(id: string, data: ProjectInput) {
  await assertAdminSession();
  const validated = ProjectSchema.parse(data);

  // Check slug collision with another project
  const existing = await prisma.project.findFirst({
    where: {
      slug: validated.slug,
      NOT: { id },
    },
  });
  if (existing) {
    throw new Error(`Another project already uses the slug "${validated.slug}".`);
  }

  const { images, ...projectData } = validated;

  // Delete previous images and re-create in transaction
  await prisma.$transaction([
    prisma.projectImage.deleteMany({ where: { projectId: id } }),
    prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        githubUrl: projectData.githubUrl || null,
        liveUrl: projectData.liveUrl || null,
        images: {
          create: images.map((img, idx) => ({
            url: img.url,
            altText: img.altText || "Project preview",
            order: img.order ?? idx,
          })),
        },
      },
    }),
  ]);

  revalidateTag("portfolio:projects", "max");
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${validated.slug}`);
  revalidatePath("/admin/projects");

  return { success: true };
}

export async function deleteProject(id: string) {
  await assertAdminSession();

  await prisma.project.delete({
    where: { id },
  });

  revalidateTag("portfolio:projects", "max");
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");

  return { success: true };
}

export async function toggleProjectPublish(id: string, published: boolean) {
  await assertAdminSession();

  await prisma.project.update({
    where: { id },
    data: { published },
  });

  revalidateTag("portfolio:projects", "max");
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");

  return { success: true };
}

export async function reorderProjects(orderedIds: string[]) {
  await assertAdminSession();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidateTag("portfolio:projects", "max");
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");

  return { success: true };
}
