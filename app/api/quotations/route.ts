import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quotation from "@/models/Quotation";
import { getCurrentUser } from "@/lib/currentUser";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function sanitizeQuotation(doc: any, isAdmin: boolean) {
  const q = doc.toObject ? doc.toObject() : doc;
  const result: any = {
    ...q,
    _id: q._id.toString(),
    id: q._id.toString(),
    quoteNumber: q.quoteNumber || `RFQ-${q._id.toString().slice(-6).toUpperCase()}`,
    date: q.createdAt ? new Date(q.createdAt).toISOString().slice(0, 10) : "",
  };

  if (!isAdmin) {
    delete result.adminNotes; // Never expose internal admin notes to customer
  }

  return result;
}

// GET QUOTATIONS
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isAdminParam = searchParams.get("admin") === "true";
    const isAdmin = currentUser.role === "admin" && isAdminParam;

    await connectToDatabase();

    const query: any = {};
    if (!isAdmin) {
      query.userId = currentUser._id;
    }

    const quotations = await Quotation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      quotations.map((q: any) => sanitizeQuotation(q, currentUser.role === "admin"))
    );
  } catch (error) {
    console.error("GET QUOTATIONS ERROR:", error);
    return NextResponse.json(
      { message: "Could not load quotations" },
      { status: 500 }
    );
  }
}

// CREATE RFQ (CUSTOMER)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title || !body.quantity) {
      return NextResponse.json(
        { message: "Title and quantity are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate unique RFQ number
    const count = await Quotation.countDocuments();
    const quoteNumber = `RFQ-2026-${(count + 1001).toString().padStart(4, "0")}`;

    const quotation = await Quotation.create({
      userId: currentUser._id,
      quoteNumber,
      title: body.title,
      category: body.category || "مطابوعات عامة",
      quantity: Number(body.quantity),
      width: Number(body.width) || 0,
      height: Number(body.height) || 0,
      material: body.material || "",
      specs: body.specs || "",
      deliveryDate: body.deliveryDate || "",
      details: body.details || "",
      company: body.company || currentUser.firstName || "",
      name: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.email,
      phone: body.phone || currentUser.phone || "",
      email: currentUser.email,
      city: body.city || "",
      attachments: Array.isArray(body.attachments) ? body.attachments : body.fileUrl ? [body.fileUrl] : [],
      status: "Pending",
    });

    // Notify admin
    await createNotification({
      userId: currentUser._id,
      title: "تم استلام طلب التسعير",
      message: `طلب التسعير رقم ${quoteNumber} قيد الدراسة من قِبل الفريق الفني.`,
      link: "/dashboard",
      type: "quote",
    });

    return NextResponse.json(
      sanitizeQuotation(quotation, false),
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE QUOTATION ERROR:", error);
    return NextResponse.json(
      { message: "Could not create quotation" },
      { status: 500 }
    );
  }
}