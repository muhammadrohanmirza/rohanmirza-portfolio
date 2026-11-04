import { NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/auth";
import { generateUploadSignature, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    await assertAdminSession();

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          configured: false,
          message: "Cloudinary credentials not configured in environment.",
        },
        { status: 200 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "rohan_portfolio";
    const signatureData = generateUploadSignature(folder);

    if (!signatureData) {
      return NextResponse.json(
        { configured: false, error: "Failed to generate upload signature." },
        { status: 500 }
      );
    }

    return NextResponse.json({ configured: true, ...signatureData });
  } catch (error) {
    console.error("Upload signing error:", error);
    return NextResponse.json(
      { error: "Unauthorized access to upload signing." },
      { status: 401 }
    );
  }
}
