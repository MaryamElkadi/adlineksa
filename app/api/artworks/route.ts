import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

import { connectToDatabase } from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { getCurrentUserId } from "@/lib/currentUser";

function serializeArtwork(artwork: any) {
  const value = artwork.toObject();

  return {
    ...value,
    _id: value._id.toString(),
    id: value._id.toString(),
    orderId: value.orderId
      ? value.orderId.toString()
      : null,
  };
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const artworks = await Artwork.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      artworks.map(serializeArtwork)
    );
  } catch (error) {
    console.error(
      "GET ARTWORKS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Could not load artworks",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let name = "";
    let fileUrl = "";
    let fileName = "";
    let fileType = "";
    let fileSize = 0;
    let description = "";
    let type = "library";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { message: "No file uploaded" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `${Date.now()}-${safeName}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      await fs.writeFile(filePath, buffer);

      name = (formData.get("name") as string) || file.name;
      fileUrl = `/uploads/${uniqueFileName}`;
      fileName = file.name;
      fileType = file.type;
      fileSize = file.size;
      description = (formData.get("description") as string) || "";
      type = (formData.get("type") as string) || "library";
    } else {
      const body = await request.json();
      name = body.name || body.fileName || "تصميم جديد";
      fileUrl = body.fileUrl;
      fileName = body.fileName || name;
      fileType = body.fileType || "";
      fileSize = body.fileSize || 0;
      description = body.description || "";
      type = body.type || "library";
    }

    if (!fileUrl) {
      return NextResponse.json(
        {
          message: "Artwork file is required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const artwork = await Artwork.create({
      name,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      description,
      type,
      userId,
    });

    return NextResponse.json(
      serializeArtwork(artwork),
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE ARTWORK ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Could not create artwork",
      },
      { status: 500 }
    );
  }
}