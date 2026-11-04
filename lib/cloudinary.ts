import crypto from "crypto";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export interface CloudinarySignature {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Generates an HMAC-SHA1 signature for secure direct browser-to-Cloudinary uploads.
 * Never exposes the CLOUDINARY_API_SECRET to the client.
 */
export function generateUploadSignature(folder = "rohan_portfolio"): CloudinarySignature | null {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  // Cloudinary signature string is sorted alphabetically by param name: "folder=...&timestamp=..."
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
  };
}

/**
 * Parses Cloudinary URL and deletes the asset via Cloudinary REST API.
 * Never throws an unhandled error; logs and returns result object.
 */
export async function deleteCloudinaryAssetByUrl(url: string): Promise<{ success: boolean; error?: string }> {
  if (!url || typeof url !== "string") {
    return { success: false, error: "Invalid URL provided." };
  }

  if (!isCloudinaryConfigured()) {
    console.warn("Cloudinary credentials not configured; skipping remote asset deletion.");
    return { success: true };
  }

  const cloudinaryRegex = /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+)$/i;
  const match = url.match(cloudinaryRegex);

  if (!match) {
    // Not a Cloudinary hosted asset (e.g. direct Unsplash link or external URL)
    return { success: true };
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || match[1];
  const resourceType = match[2].toLowerCase() as "image" | "video" | "raw";
  const rawPath = match[3];
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  // For image/video, Cloudinary public_id strips the extension.
  // For raw assets (e.g. PDFs), public_id often includes the extension.
  const decodedPath = decodeURIComponent(rawPath);
  const publicId = resourceType === "raw" ? decodedPath : decodedPath.replace(/\.[^/.]+$/, "");

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: publicId,
          timestamp,
          api_key: apiKey,
          signature,
        }),
      }
    );

    const data = await response.json().catch(() => null);

    if (data?.result === "ok") {
      return { success: true };
    }

    // Fallback attempt for raw files without extension if first attempt didn't return "ok"
    if (resourceType === "raw" && decodedPath.includes(".")) {
      const altPublicId = decodedPath.replace(/\.[^/.]+$/, "");
      const altParams = `public_id=${altPublicId}&timestamp=${timestamp}${apiSecret}`;
      const altSignature = crypto.createHash("sha1").update(altParams).digest("hex");

      const altResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_id: altPublicId,
            timestamp,
            api_key: apiKey,
            signature: altSignature,
          }),
        }
      );
      const altData = await altResponse.json().catch(() => null);
      if (altData?.result === "ok") {
        return { success: true };
      }
    }

    console.warn("Cloudinary asset deletion returned non-ok result:", data);
    return { success: false, error: data?.error?.message || "Failed to destroy asset" };
  } catch (err) {
    console.error("Cloudinary asset deletion request error:", err);
    return { success: false, error: String(err) };
  }
}

