import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Artwork from "@/models/Artwork";
import { getCurrentUser } from "@/lib/currentUser";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function serializeProof(doc: any) {
  const p = doc.toObject ? doc.toObject() : doc;
  return {
    ...p,
    _id: p._id.toString(),
    id: p._id.toString(),
    date: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "",
  };
}

export async function GET(
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

    const proof = await Artwork.findById(id).lean();

    if (!proof) {
      return NextResponse.json({ message: "Proof not found" }, { status: 404 });
    }

    if (
      currentUser.role !== "admin" &&
      proof.userId?.toString() !== currentUser._id?.toString()
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(serializeProof(proof));
  } catch (error) {
    console.error("GET PROOF BY ID ERROR:", error);
    return NextResponse.json(
      { message: "Could not load proof" },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();
    await connectToDatabase();

    const proof = await Artwork.findById(id);

    if (!proof) {
      return NextResponse.json({ message: "Proof not found" }, { status: 404 });
    }

    // Customer Action: Approve or Request Changes
    if (currentUser.role !== "admin") {
      if (proof.userId?.toString() !== currentUser._id?.toString()) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      if (body.action === "approve" || body.proofStatus === "approved") {
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

        return NextResponse.json(serializeProof(proof));
      }

      if (body.action === "request_changes" || body.proofStatus === "revision_requested") {
        proof.proofStatus = "revision_requested";
        proof.revisionNote = body.revisionNote || body.note || "يرجى التعديل حسب الملاحظات.";
        await proof.save();

        await createNotification({
          userId: proof.userId.toString(),
          title: "تم تقديم طلب تعديل البروفة 📝",
          message: `تم إرسال ملاحظاتك حول بروفة (${proof.name}) إلى فريق التصميم.`,
          link: "/dashboard",
          type: "proof",
        });

        return NextResponse.json(serializeProof(proof));
      }

      return NextResponse.json({ message: "Invalid proof action" }, { status: 400 });
    }

    // Admin Action: Upload new revision version
    if (body.fileUrl) {
      const nextVersion = (proof.version || 1) + 1;
      proof.versionHistory.push({
        version: proof.version || 1,
        fileUrl: proof.fileUrl,
        fileName: proof.fileName || proof.name,
        fileSize: proof.fileSize || 0,
        note: proof.revisionNote || "إصدار سابق",
        createdAt: proof.updatedAt || new Date(),
      });

      proof.fileUrl = body.fileUrl;
      proof.fileName = body.fileName || proof.name;
      proof.fileSize = Number(body.fileSize) || proof.fileSize;
      proof.version = nextVersion;
      proof.proofStatus = "pending";
      proof.revisionNote = "";
      if (body.adminComment) proof.adminComment = body.adminComment;

      await proof.save();

      await createNotification({
        userId: proof.userId.toString(),
        title: `تحديث بروفة التصميم (الإصدار v${nextVersion})`,
        message: `قام المصمم برفع تعديل جديد لبروفة (${proof.name}) v${nextVersion}. يرجى المراجعة.`,
        link: "/dashboard",
        type: "proof",
      });
    } else {
      if (body.proofStatus) proof.proofStatus = body.proofStatus;
      if (body.adminComment) proof.adminComment = body.adminComment;
      await proof.save();
    }

    return NextResponse.json(serializeProof(proof));
  } catch (error) {
    console.error("PATCH PROOF ERROR:", error);
    return NextResponse.json(
      { message: "Could not update design proof" },
      { status: 500 }
    );
  }
}
