import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quotation from "@/models/Quotation";
import { getCurrentUserId } from "@/lib/currentUser";

function serializeQuotation(quotation: any) {
  const value = quotation.toObject();

  return {
    ...value,
    _id: value._id.toString(),
    id: value._id.toString(),
  };
}

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    // Pagination parameters (optional)
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    // Projection: only fields needed for listings
    const projection = { _id: 1, title: 1, createdAt: 1, status: 1, userId: 1 };
    // Base query with projection, sorting, and lean for plain objects
    let quotationsQuery = Quotation.find({ userId }, projection).sort({ createdAt: -1 }).lean();
    if (page > 0 && limit > 0) {
      const total = await Quotation.countDocuments({ userId });
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      quotationsQuery = quotationsQuery.skip(skip).limit(limit);
      const quotations = await quotationsQuery;
      return NextResponse.json({
        quotations: quotations.map(serializeQuotation),
        pagination: { page, limit, total, totalPages },
      });
    }
    // No pagination – return all (still lean + projection)
    const quotations = await quotationsQuery;

    return NextResponse.json(quotations.map(serializeQuotation));
  } catch (error) {
    console.error("GET QUOTATIONS ERROR:", error);

    return NextResponse.json(
      { message: "Could not load quotations" },
      { status: 500 }
    );
  }
}

import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ((!body.name && !body.title) || !body.quantity) {
      return NextResponse.json(
        {
          message: "Title/Name and quantity are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(userId);

    const quotation = await Quotation.create({
      title: body.title || body.name || "طلب تسعير",
      specs: body.specs || body.details || "",
      name: body.name || (user ? `${user.firstName} ${user.lastName}` : "عميل"),
      email: body.email || (user ? user.email : "user@example.com"),
      phone: body.phone || (user && user.phone ? user.phone : "غير مدخل"),
      ...body,
      userId,
    });

    return NextResponse.json(
      serializeQuotation(quotation),
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