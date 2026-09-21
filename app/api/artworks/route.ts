import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { getCurrentUser } from "@/lib/currentUser";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

function serializeArtwork(doc: any) {
  const a = doc.toObject ? doc.toObject() : doc;
  return {
    ...a,
    _id: a._id.toString(),
    id: a._id.toString(),
    date: a.createdAt ? new Date(a.createdAt).toISOString().slice(0, 10) : "",
  };
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isAdmin = currentUser.role === "admin" && searchParams.get("admin") === "true";

    await connectToDatabase();

    const query: any = { type: "library" };
    if (!isAdmin) {
      query.userId = currentUser._id;
    }

    const artworks = await Artwork.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(artworks.map(serializeArtwork));
  } catch (error) {
    console.error("GET ARTWORKS ERROR:", error);
    return NextResponse.json(
      { message: "Could not load design library" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let name = "تصميم جديد";
    let fileUrl = "";
    let fileName = "";
    let fileType = "pdf";
    let fileSize = 0;
    let targetUserId = currentUser._id.toString();

    await connectToDatabase();

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const customName = formData.get("name") as string | null;
      const targetUser = formData.get("userId") as string | null;

      if (currentUser.role === "admin" && targetUser) {
        targetUserId = targetUser;
      }

      if (!file) {
        return NextResponse.json({ message: "No file provided" }, { status: 400 });
      }

      fileName = file.name;
      name = customName || file.name;
      fileSize = file.size;
      fileType = file.name.split(".").pop() || "pdf";

      // Upload file to Cloudinary if credentials present or store buffer URL
      const buffer = Buffer.from(await file.arrayBuffer());

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "adline_artworks",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });
        fileUrl = uploadResult.secure_url;
      } else {
        // Fallback data URI / object store URL
        fileUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      }
    } else {
      const body = await request.json();
      name = body.name || "تصميم جديد";
      fileUrl = body.fileUrl || "";
      fileName = body.fileName || name;
      fileType = body.fileType || "pdf";
      fileSize = Number(body.fileSize) || 0;

      if (currentUser.role === "admin" && body.userId) {
        targetUserId = body.userId;
      }
    }

    if (!fileUrl) {
      return NextResponse.json({ message: "File URL is required" }, { status: 400 });
    }

    const artwork = await Artwork.create({
      userId: targetUserId,
      name,
      fileName,
      fileUrl,
      fileType,
      fileSize,
      type: "library",
    });

    return NextResponse.json(serializeArtwork(artwork), { status: 201 });
  } catch (error) {
    console.error("CREATE ARTWORK ERROR:", error);
    return NextResponse.json(
      { message: "Could not upload design" },
      { status: 500 }
    );
  }
}