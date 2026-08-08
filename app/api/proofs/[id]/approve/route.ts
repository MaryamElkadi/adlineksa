import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { getCurrentUserId } from "@/lib/currentUser";

function serializeProof(proof: any) {
  const value = proof.toObject();

  return {
    ...value,
    _id: value._id.toString(),
    id: value._id.toString(),
    orderId: value.orderId ? value.orderId.toString() : null,
  };
}

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

    await connectToDatabase();

    const proof = await Artwork.findOneAndUpdate(
      { _id: id, userId },
      { proofStatus: "approved" },
      { new: true }
    );

    if (!proof) {
      return NextResponse.json(
        { message: "Proof not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeProof(proof));
  } catch (error) {
    console.error("APPROVE PROOF ERROR:", error);
    return NextResponse.json(
      { message: "Could not approve proof" },
      { status: 500 }
    );
  }
}
