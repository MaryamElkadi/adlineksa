import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getCurrentUserId } from "@/lib/currentUser";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    await connectToDatabase();

    const ticket = await Ticket.findOne({
      _id: id,
      userId,
    });

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error(
      "GET TICKET ERROR:",
      error
    );

    return NextResponse.json(
      { message: "Could not load ticket" },
      { status: 500 }
    );
  }
}