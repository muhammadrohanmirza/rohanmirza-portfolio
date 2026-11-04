import { redirect } from "next/navigation";

interface ProjectRedirectProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export default async function ProjectIdRedirectPage({ params }: ProjectRedirectProps) {
  const { id } = await params;
  redirect(`/admin/projects/${id}/edit`);
}
