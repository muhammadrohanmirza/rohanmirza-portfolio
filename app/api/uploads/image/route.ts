import { NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/auth";
import { isCloudinaryConfigured, generateUploadSignature } from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/pjpeg",
  "image/jfif",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    await assertAdminSession();

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { success: false, error: "Invalid form data submission." },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "rohan_portfolio";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file was provided in the request." },
        { status: 400 }
      );
    }

    // 1. Validate MIME type or file extension
    const extension = path.extname(file.name).toLowerCase();
    const isAllowedExt = [".jpg", ".jpeg", ".jfif", ".png", ".webp", ".gif", ".svg", ".avif"].includes(extension);
    const isAllowedMime = ALLOWED_MIME_TYPES.has(file.type);

    if (!isAllowedMime && !isAllowedExt) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Allowed formats: PNG, JPG, WebP, GIF, SVG, AVIF.",
        },
        { status: 400 }
      );
    }

    // 2. Validate max size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Try Cloudinary if configured
    if (isCloudinaryConfigured()) {
      try {
        const signData = generateUploadSignature(folder);
        if (signData) {
          const cloudFormData = new FormData();
          const blob = new Blob([buffer], { type: file.type || "image/jpeg" });
          cloudFormData.append("file", blob, file.name);
          cloudFormData.append("api_key", signData.apiKey);
          cloudFormData.append("timestamp", String(signData.timestamp));
          cloudFormData.append("signature", signData.signature);
          cloudFormData.append("folder", signData.folder);

          const cloudRes = await fetch(
            `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
            {
              method: "POST",
              body: cloudFormData,
            }
          );

          const cloudJson = await cloudRes.json();
          if (cloudJson.secure_url) {
            return NextResponse.json({
              success: true,
              url: cloudJson.secure_url,
              provider: "cloudinary",
            });
          } else {
            console.warn(
              "Cloudinary rejected upload, falling back to local storage:",
              cloudJson.error?.message
            );
          }
        }
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to local storage:", cloudErr);
      }
    }

    // 4. Fallback: Save file locally in public/uploads/images
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "images");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeBase = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/\.[^/.]+$/, "");
    const safeExt = extension || ".jpg";
    const filename = `${safeBase}-${Date.now()}${safeExt}`;
    const targetPath = path.join(uploadsDir, filename);

    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/images/${filename}`,
      provider: "local",
    });
  } catch (error) {
    console.error("Image upload processing error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during image upload." },
      { status: 500 }
    );
  }
}
