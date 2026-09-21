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
    delete result.adminNotes;
  }

  return result;
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

    const quotation = await Quotation.findById(id).lean();

    if (!quotation) {
      return NextResponse.json(
        { message: "Quotation not found" },
        { status: 404 }
      );
    }

    if (
      currentUser.role !== "admin" &&
      quotation.userId?.toString() !== currentUser._id?.toString()
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      sanitizeQuotation(quotation, currentUser.role === "admin")
    );
  } catch (error) {
    console.error("GET QUOTATION BY ID ERROR:", error);
    return NextResponse.json(
      { message: "Could not load quotation." },
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

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return NextResponse.json(
        { message: "Quotation not found." },
        { status: 404 }
      );
    }

    // Customer can only accept/reject their own quote if allowed; Admin can update everything
    if (currentUser.role !== "admin") {
      if (quotation.userId?.toString() !== currentUser._id?.toString()) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      // Customer action (Accept or Reject)
      if (body.status === "Accepted" || body.status === "Rejected") {
        quotation.status = body.status;
        await quotation.save();
        return NextResponse.json(sanitizeQuotation(quotation, false));
      }

      return NextResponse.json(
        { message: "Customers can only accept or reject quotes." },
        { status: 403 }
      );
    }

    // Admin updates
    if (body.quotationPrice !== undefined) {
      const price = Number(body.quotationPrice) || 0;
      const vat = Math.round(price * 0.15 * 100) / 100;
      quotation.quotationPrice = price;
      quotation.vatAmount = vat;
      quotation.totalPrice = Math.round((price + vat) * 100) / 100;
    }

    if (body.status) quotation.status = body.status;
    if (body.validUntil !== undefined) quotation.validUntil = body.validUntil;
    if (body.customerNotes !== undefined) quotation.customerNotes = body.customerNotes;
    if (body.adminNotes !== undefined) quotation.adminNotes = body.adminNotes;

    await quotation.save();

    // Send customer notification when price is set
    if (body.status === "Quoted" || (body.quotationPrice && body.quotationPrice > 0)) {
      await createNotification({
        userId: quotation.userId.toString(),
        title: "تم صدور عرض السعر",
        message: `تم تحديد سعر طلب التسعير (${quotation.quoteNumber || "RFQ"}) بمبلغ ${quotation.totalPrice} ر.س (شامل الضريبة).`,
        link: "/dashboard",
        type: "quote",
      });
    }

    return NextResponse.json(sanitizeQuotation(quotation, true));
  } catch (error) {
    console.error("PATCH QUOTATION ERROR:", error);
    return NextResponse.json(
      { message: "Could not update quotation." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const quotation = await Quotation.findByIdAndDelete(id);

    if (!quotation) {
      return NextResponse.json(
        { message: "Quotation not found." },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE QUOTATION ERROR:", error);
    return NextResponse.json(
      { message: "Could not delete quotation." },
      { status: 500 }
    );
  }
}