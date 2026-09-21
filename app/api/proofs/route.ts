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

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isAdmin = currentUser.role === "admin" && searchParams.get("admin") === "true";

    await connectToDatabase();

    const query: any = { type: "proof" };
    if (!isAdmin) {
      query.userId = currentUser._id;
    }

    const proofs = await Artwork.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(proofs.map(serializeProof));
  } catch (error) {
    console.error("GET PROOFS ERROR:", error);
    return NextResponse.json(
      { message: "Could not load design proofs" },
      { status: 500 }
    );
  }
}

// CREATE PROOF (ADMIN)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Admin required" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.userId || !body.fileUrl || !body.name) {
      return NextResponse.json(
        { message: "User ID, proof name, and file URL are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const proof = await Artwork.create({
      userId: body.userId,
      orderId: body.orderId || null,
      name: body.name,
      description: body.description || "",
      fileUrl: body.fileUrl,
      fileName: body.fileName || body.name,
      fileType: body.fileType || "pdf",
      fileSize: Number(body.fileSize) || 0,
      type: "proof",
      proofStatus: "pending",
      version: 1,
      adminComment: body.adminComment || "",
      versionHistory: [
        {
          version: 1,
          fileUrl: body.fileUrl,
          fileName: body.fileName || body.name,
          fileSize: Number(body.fileSize) || 0,
          note: body.adminComment || "النسخة الأولى من البروفة",
          createdAt: new Date(),
        },
      ],
    });

    // Notify Customer
    await createNotification({
      userId: body.userId,
      title: "بروفة تصميم جديدة 🔍",
      message: `تم رفع بروفة تصميم جديدة (${body.name}) بانتظار مراجعتك واعتمادك.`,
      link: "/dashboard",
      type: "proof",
    });

    return NextResponse.json(serializeProof(proof), { status: 201 });
  } catch (error) {
    console.error("CREATE PROOF ERROR:", error);
    return NextResponse.json(
      { message: "Could not create design proof" },
      { status: 500 }
    );
  }
}
