import { NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/auth";
import { isCloudinaryConfigured, generateUploadSignature } from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";

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
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file was provided in the request." },
        { status: 400 }
      );
    }

    // 1. Server-side validation: MIME type must be PDF
    const isPdfType = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfType) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF documents (.pdf) are allowed." },
        { status: 400 }
      );
    }

    // 2. Server-side validation: Max size 10MB
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 10MB limit (File is ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. If Cloudinary is configured, upload to Cloudinary (raw/auto)
    if (isCloudinaryConfigured()) {
      const folder = "rohan_portfolio/resumes";
      const signData = generateUploadSignature(folder);

      if (signData) {
        const cloudFormData = new FormData();
        const blob = new Blob([buffer], { type: "application/pdf" });
        cloudFormData.append("file", blob, file.name);
        cloudFormData.append("api_key", signData.apiKey);
        cloudFormData.append("timestamp", String(signData.timestamp));
        cloudFormData.append("signature", signData.signature);
        cloudFormData.append("folder", signData.folder);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
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
        }
      }
    }

    // 4. Fallback: Save locally into public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeFilename = `resume-${Date.now()}.pdf`;
    const targetPath = path.join(uploadsDir, safeFilename);
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${safeFilename}`,
      provider: "local",
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during resume document processing." },
      { status: 500 }
    );
  }
}
