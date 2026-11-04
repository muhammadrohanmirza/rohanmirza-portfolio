import React from "react";
import { notFound } from "next/navigation";
import { getAdminProjectById } from "@/lib/queries/admin.queries";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const instant = false;

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = await getAdminProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectForm initialData={project} />;
}
