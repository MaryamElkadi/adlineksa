import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getCurrentUserId } from "@/lib/currentUser";

function serializeTicket(ticket: any) {
  const value = ticket.toObject();

  return {
    ...value,
    _id: value._id.toString(),
    id: value._id.toString(),
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

    const tickets = await Ticket.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      tickets.map(serializeTicket)
    );
  } catch (error) {
    console.error(
      "GET TICKETS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Could not load tickets",
      },
      { status: 500 }
    );
  }
}

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

    if (!body.subject || !body.message) {
      return NextResponse.json(
        {
          message:
            "Subject and message are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const ticket = await Ticket.create({
      ...body,

      userId,

      ticketNumber: `TKT-${Date.now()
        .toString()
        .slice(-8)}`,

      status: "Open",
    });

    return NextResponse.json(
      serializeTicket(ticket),
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE TICKET ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Could not create ticket",
      },
      { status: 500 }
    );
  }
}