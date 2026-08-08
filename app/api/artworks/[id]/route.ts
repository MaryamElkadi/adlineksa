import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { getCurrentUserId } from "@/lib/currentUser";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (
      !["approved", "revision_requested"].includes(
        body.proofStatus
      )
    ) {
      return NextResponse.json(
        { message: "Invalid proof status." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // IMPORTANT:
    // The artwork must belong to the logged-in user.
    const artwork = await Artwork.findOne({
      _id: id,
      userId,
      type: "proof",
    });

    if (!artwork) {
      return NextResponse.json(
        { message: "Artwork not found." },
        { status: 404 }
      );
    }

    artwork.proofStatus = body.proofStatus;

    if (body.proofStatus === "revision_requested") {
      artwork.revisionNote = body.revisionNote || "";
    } else {
      artwork.revisionNote = "";
    }

    await artwork.save();

    return NextResponse.json({
      success: true,
      artwork: {
        ...artwork.toObject(),
        _id: artwork._id.toString(),
        id: artwork._id.toString(),
      },
    });
  } catch (error) {
    console.error("UPDATE ARTWORK ERROR:", error);

    return NextResponse.json(
      {
        message: "Could not update artwork.",
      },
      {
        status: 500,
      }
    );
  }
}