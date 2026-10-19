import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getCurrentUser } from "@/lib/currentUser";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function sanitizeTicket(doc: any, isAdmin: boolean) {
  const t = doc.toObject ? doc.toObject() : doc;

  // Filter internal notes out for customers
  const messages = Array.isArray(t.messages)
    ? t.messages.filter((m: any) => isAdmin || !m.isInternalNote)
    : [];

  return {
    ...t,
    _id: t._id.toString(),
    id: t._id.toString(),
    messages: messages.map((m: any) => ({
      ...m,
      _id: m._id ? m._id.toString() : undefined,
    })),
    date: t.createdAt ? new Date(t.createdAt).toISOString().slice(0, 10) : "",
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
    const statusFilter = searchParams.get("status") || "";

    await connectToDatabase();

    const query: any = {};
    if (!isAdmin) {
      query.userId = currentUser._id;
    }

    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }

    // Pagination parameters (optional)
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    // Projection: only fields needed for list view
    const projection = { _id: 1, ticketNumber: 1, subject: 1, status: 1, priority: 1, updatedAt: 1, messages: 1, userId: 1 };

    // Base query with projection, sorting, and lean for plain objects
    let ticketsQuery = Ticket.find(query, projection).sort({ updatedAt: -1 }).lean();

    // If pagination requested, apply skip/limit and include pagination metadata
    if (page > 0 && limit > 0) {
      const total = await Ticket.countDocuments(query);
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      ticketsQuery = ticketsQuery.skip(skip).limit(limit);
      const tickets = await ticketsQuery;
      return NextResponse.json({
        tickets: tickets.map((t: any) => sanitizeTicket(t, currentUser.role === "admin")),
        pagination: { page, limit, total, totalPages },
      });
    }

    // No pagination – return all (still lean + projection)
    const tickets = await ticketsQuery;
    return NextResponse.json(
      tickets.map((t: any) => sanitizeTicket(t, currentUser.role === "admin"))
    );
  } catch (error) {
    console.error("GET TICKETS ERROR:", error);
    return NextResponse.json(
      { message: "Could not load support tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.subject || !body.message) {
      return NextResponse.json(
        { message: "Subject and message are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const count = await Ticket.countDocuments();
    const ticketNumber = `TCK-2026-${(count + 1001).toString().padStart(4, "0")}`;

    const senderName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.email;

    const ticket = await Ticket.create({
      userId: currentUser._id,
      ticketNumber,
      subject: body.subject,
      category: body.category || "عام",
      priority: body.priority || "Medium",
      message: body.message,
      status: "Open",
      messages: [
        {
          sender: "customer",
          senderName,
          text: body.message,
          attachments: Array.isArray(body.attachments) ? body.attachments : [],
          isInternalNote: false,
          createdAt: new Date(),
        },
      ],
    });

    await createNotification({
      userId: currentUser._id.toString(),
      title: "تم إنشاء تذكرة الدعم الفني",
      message: `تذكرة الدعم رقم ${ticketNumber} مفتوحة وسيتم الرد عليك قريباً.`,
      link: "/dashboard",
      type: "ticket",
    });

    return NextResponse.json(sanitizeTicket(ticket, false), { status: 201 });
  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);
    return NextResponse.json(
      { message: "Could not create support ticket" },
      { status: 500 }
    );
  }
}