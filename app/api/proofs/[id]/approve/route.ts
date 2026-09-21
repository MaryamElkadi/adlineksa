import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { getCurrentUser } from "@/lib/currentUser";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const proof = await Artwork.findById(id);

    if (!proof) {
      return NextResponse.json({ message: "Proof not found" }, { status: 404 });
    }

    if (
      currentUser.role !== "admin" &&
      proof.userId?.toString() !== currentUser._id?.toString()
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    proof.proofStatus = "approved";
    proof.revisionNote = "";
    await proof.save();

    await createNotification({
      userId: proof.userId.toString(),
      title: "تم اعتماد بروفة التصميم ✓",
      message: `شكراً لك! تم اعتماد بروفة التصميم (${proof.name}) وسيتم نقل الطلب لمرحلة الطباعة.`,
      link: "/dashboard",
      type: "proof",
    });

    const result = proof.toObject ? proof.toObject() : proof;

    return NextResponse.json({
      ...result,
      _id: result._id.toString(),
      id: result._id.toString(),
    });
  } catch (error) {
    console.error("APPROVE PROOF ERROR:", error);
    return NextResponse.json(
      { message: "Could not approve design proof" },
      { status: 500 }
    );
  }
}
