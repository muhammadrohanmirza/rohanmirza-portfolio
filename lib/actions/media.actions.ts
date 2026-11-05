"use server";

import { assertAdminSession } from "../auth";
import { deleteCloudinaryAssetByUrl } from "../cloudinary";
import prisma from "../prisma";
import fs from "fs/promises";
import path from "path";

/**
 * Server action to delete an uploaded media asset (Cloudinary or local storage)
 * Verifies admin session before executing.
 * Gracefully logs and catches errors so saving changes is never blocked.
 */
export async function deleteMediaAsset(url: string | null | undefined): Promise<{ success: boolean }> {
  if (!url || typeof url !== "string" || !url.trim()) {
    return { success: true };
  }

  try {
    // 1. Verify admin session
    await assertAdminSession();

    const trimmedUrl = url.trim();

    // 2. If it's a Cloudinary asset, only delete it when it's not still referenced elsewhere.
    if (trimmedUrl.includes("res.cloudinary.com")) {
      const isStillReferenced = await prisma.profile
        .findFirst({
          where: {
            OR: [
              { avatarUrl: trimmedUrl },
              { aboutImageUrl: trimmedUrl },
            ],
          },
          select: { id: true },
        })
        .then((profileMatch) => Boolean(profileMatch))
        .catch(() => false);

      const isHomepageHeroReferenced = await prisma.homepageContent
        .findFirst({
          where: { heroImageUrl: trimmedUrl },
          select: { id: true },
        })
        .then((match) => Boolean(match))
        .catch(() => false);

      if (isStillReferenced || isHomepageHeroReferenced) {
        return { success: true };
      }

      const result = await deleteCloudinaryAssetByUrl(trimmedUrl);
      if (!result.success) {
        console.error("Cloudinary asset deletion error for URL:", trimmedUrl, result.error);
      }
      return { success: true };
    }

    // 3. If it's a local upload in /uploads/, attempt local file cleanup
    if (trimmedUrl.startsWith("/uploads/")) {
      try {
        const localRelPath = trimmedUrl.replace(/^\/+/, "");
        const localAbsPath = path.join(process.cwd(), "public", localRelPath);
        // Ensure path stays within public/uploads directory for safety
        const safeBase = path.join(process.cwd(), "public", "uploads");
        if (localAbsPath.startsWith(safeBase)) {
          await fs.unlink(localAbsPath).catch(() => null);
        }
      } catch (fileErr) {
        console.warn("Could not remove local upload file:", fileErr);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to delete media asset (admin session or deletion error):", err);
    // User requirement: "If that fails, still save and only log the error."
    return { success: false };
  }
}
