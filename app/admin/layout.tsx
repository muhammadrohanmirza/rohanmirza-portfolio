import React from "react";
import { assertAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import prisma from "@/lib/prisma";

import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin Dashboard | Rohan.Dev",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await assertAdminSession();

  let unreadCount = 0;
  let profile = null;
  try {
    const [unread, prof] = await Promise.all([
      prisma.contactMessage.count({
        where: { isRead: false },
      }),
      prisma.profile.findFirst({
        select: { name: true, avatarUrl: true },
      }),
    ]);
    unreadCount = unread;
    profile = prof;
  } catch {
    // If DB is offline
  }

  return (
    <AdminShell
      unreadCount={unreadCount}
      adminName={profile?.name || session.name || "Rohan"}
      adminEmail={session.email}
      adminAvatar={profile?.avatarUrl || null}
    >
      {children}
    </AdminShell>
  );
}
