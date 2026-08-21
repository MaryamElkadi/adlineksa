import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SallaStore from "@/models/SallaStore";

export async function GET() {
  try {
    await connectToDatabase();
    const connection = await SallaStore.findOne({ merchantId: "primary" }).lean();

    return NextResponse.json({
      connected: Boolean(connection),
      connectedAt: connection?.updatedAt || connection?.createdAt || null,
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
