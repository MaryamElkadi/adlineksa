import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getCurrentUser } from "@/lib/currentUser";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function sanitizeTicket(doc: any, isAdmin: boolean) {
  const t = doc.toObject ? doc.toObject() : doc;

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

    const ticket = await Ticket.findById(id).lean();

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    if (
      currentUser.role !== "admin" &&
      ticket.userId?.toString() !== currentUser._id?.toString()
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(sanitizeTicket(ticket, currentUser.role === "admin"));
  } catch (error) {
    console.error("GET TICKET BY ID ERROR:", error);
    return NextResponse.json(
      { message: "Could not load ticket details" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    if (!body.text && !body.message) {
      return NextResponse.json({ message: "Message text is required" }, { status: 400 });
    }

    await connectToDatabase();

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    if (
      currentUser.role !== "admin" &&
      ticket.userId?.toString() !== currentUser._id?.toString()
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const isInternal = currentUser.role === "admin" && Boolean(body.isInternalNote);
    const sender = currentUser.role === "admin" ? "admin" : "customer";
    const senderName =
      currentUser.role === "admin"
        ? "فريق الدعم الفني 🛡️"
        : `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.email;

    const newMessage = {
      sender,
      senderName,
      text: body.text || body.message,
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
      isInternalNote: isInternal,
      createdAt: new Date(),
    };

    ticket.messages.push(newMessage as any);

    if (currentUser.role === "admin") {
      ticket.adminReply = body.text || body.message;
      if (!isInternal && ticket.status === "Open") {
        ticket.status = "In Progress";
      }
    } else {
      if (ticket.status === "Resolved" || ticket.status === "Closed") {
        ticket.status = "Open";
      }
    }

    if (body.status && currentUser.role === "admin") {
      ticket.status = body.status;
    }

    await ticket.save();

    // Notify customer if admin replied publicly
    if (currentUser.role === "admin" && !isInternal) {
      await createNotification({
        userId: ticket.userId.toString(),
        title: "رد جديد على تذكرة الدعم",
        message: `قام فريق الدعم بالرد على تذكرتك رقم (${ticket.ticketNumber}).`,
        link: "/dashboard",
        type: "ticket",
      });
    }

    return NextResponse.json(sanitizeTicket(ticket, currentUser.role === "admin"));
  } catch (error) {
    console.error("ADD TICKET MESSAGE ERROR:", error);
    return NextResponse.json(
      { message: "Could not post message to ticket" },
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

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    if (
      currentUser.role !== "admin" &&
      ticket.userId?.toString() !== currentUser._id?.toString()
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (body.status) ticket.status = body.status;
    if (body.priority && currentUser.role === "admin") ticket.priority = body.priority;

    await ticket.save();

    return NextResponse.json(sanitizeTicket(ticket, currentUser.role === "admin"));
  } catch (error) {
    console.error("PATCH TICKET ERROR:", error);
    return NextResponse.json(
      { message: "Could not update ticket" },
      { status: 500 }
    );
  }
}