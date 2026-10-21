import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import cloudinary from "@/lib/cloudinary";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const videoTypes = new Set(["video/mp4", "video/webm"]);
const imageMaxBytes = 10 * 1024 * 1024;
const videoMaxBytes = Math.min(500, Math.max(1, Number(process.env.MAX_MEDIA_VIDEO_SIZE_MB) || 100)) * 1024 * 1024;

export const runtime = "nodejs";

function matchesFileSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  if (mimeType === "video/mp4") return buffer.toString("ascii", 4, 8) === "ftyp";
  if (mimeType === "video/webm") return buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  return false;
}

function getUploadErrorDetails(error: unknown): { message: string; httpCode?: number } {
  if (typeof error === "string") return { message: error };
  if (!error || typeof error !== "object") return { message: "Unknown upload error." };

  const response = error as {
    message?: unknown;
    http_code?: unknown;
    error?: unknown;
  };
  const nestedError = response.error && typeof response.error === "object"
    ? response.error as { message?: unknown; http_code?: unknown }
    : undefined;
  const message = nestedError?.message ?? response.message;
  const httpCode = nestedError?.http_code ?? response.http_code;

  return {
    message: typeof message === "string" ? message : "Cloudinary returned an unrecognized error.",
    ...(typeof httpCode === "number" ? { httpCode } : {}),
  };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = formData.get("kind");
    if (!(file instanceof File) || (kind !== "image" && kind !== "video")) {
      return NextResponse.json({ message: "Choose a valid image or video file." }, { status: 400 });
    }

    const allowedTypes = kind === "image" ? imageTypes : videoTypes;
    const maxBytes = kind === "image" ? imageMaxBytes : videoMaxBytes;
    if (!allowedTypes.has(file.type) || file.size <= 0 || file.size > maxBytes) {
      return NextResponse.json({
        message: kind === "image"
          ? "Images must be JPG, PNG, or WebP and no larger than 10 MB."
          : `Videos must be MP4 or WebM and no larger than ${Math.floor(videoMaxBytes / 1024 / 1024)} MB.`,
      }, { status: 400 });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ message: "Cloudinary is not configured, so file uploads are unavailable. You can still add a YouTube or Vimeo video URL." }, { status: 503 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!matchesFileSignature(buffer, file.type)) {
      return NextResponse.json({ message: "The file contents do not match the selected media type." }, { status: 400 });
    }
    const resourceType = kind === "image" ? "image" : "video";
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream({
        resource_type: resourceType,
        folder: `adline_${kind}s`,
        ...(kind === "image" ? { format: "webp", transformation: [{ quality: "auto", fetch_format: "auto" }] } : {}),
      }, (error, uploaded) => {
        if (error) reject(error);
        else if (!uploaded?.secure_url || !uploaded.public_id) reject(new Error("Cloudinary returned an incomplete upload result."));
        else resolve({ secure_url: uploaded.secure_url, public_id: uploaded.public_id });
      });
      upload.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      provider: kind === "video" ? "cloudinary" : undefined,
    }, { status: 201 });
  } catch (error) {
    const details = getUploadErrorDetails(error);
    console.error("Media upload failed:", details);
    return NextResponse.json({
      message: "تعذر رفع الملف حالياً. يرجى المحاولة مرة أخرى أو استخدام رابط فيديو مدعوم.",
    }, { status: 502 });
  }
}
