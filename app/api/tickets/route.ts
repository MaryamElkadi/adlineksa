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

    const tickets = await Ticket.find(query).sort({ updatedAt: -1 }).lean();

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