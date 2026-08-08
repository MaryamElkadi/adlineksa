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

    const proofs = await Artwork.find({
      userId,
      type: "proof",
    }).sort({ createdAt: -1 });

    return NextResponse.json(proofs.map(serializeProof));
  } catch (error) {
    console.error("GET PROOFS ERROR:", error);
    return NextResponse.json(
      { message: "Could not load proofs" },
      { status: 500 }
    );
  }
}
