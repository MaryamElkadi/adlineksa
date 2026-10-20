import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/currentUser";
import Order from "@/models/Order";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function makeDownloadName(productName: string, fileUrl: string, contentType: string) {
  const safeProductName = productName.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim() || "design";
  const urlExtension = fileUrl.match(/\.([a-z0-9]{1,10})(?:$|[?#])/i)?.[1];
  const mimeExtension = contentType.split("/")[1]?.split(";")[0]?.replace("jpeg", "jpg");
  const extension = urlExtension || (mimeExtension && /^[a-z0-9]{1,10}$/i.test(mimeExtension) ? mimeExtension : "bin");
  return `${safeProductName}.${extension}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id, itemId } = await params;
    if (!/^[a-f\d]{24}$/i.test(id) || (itemId !== "undefined" && !/^\d+$/.test(itemId))) {
      return NextResponse.json({ message: "Invalid order or item." }, { status: 400 });
    }

    await connectToDatabase();
    const order = await Order.findById(id).select("items").lean();
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const itemIndex = itemId === "undefined" ? -1 : Number(itemId);
    const fileItems = itemId === "undefined"
      ? order.items.filter((orderItem: { fileUrl?: string }) => Boolean(orderItem.fileUrl))
      : [];
    if (itemId === "undefined" && fileItems.length !== 1) {
      return NextResponse.json(
        { message: "This old download link is ambiguous. Refresh the admin orders page and try again." },
        { status: 409 }
      );
    }
    const item = (itemId === "undefined"
      ? fileItems[0]
      : Number.isSafeInteger(itemIndex) ? order.items[itemIndex] : undefined) as
      | { fileUrl?: string; productName?: string }
      | undefined;
    if (!item?.fileUrl) {
      return NextResponse.json({ message: "File not found for this order item." }, { status: 404 });
    }

    let file: Uint8Array;
    let contentType = "application/octet-stream";
    const dataUrl = item.fileUrl.match(/^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);

    if (dataUrl) {
      const encodedFile = dataUrl[2].replace(/\s/g, "");
      if (encodedFile.length > Math.ceil(MAX_FILE_SIZE * 4 / 3)) {
        return NextResponse.json({ message: "File exceeds the 50MB download limit." }, { status: 413 });
      }
      const buffer = Buffer.from(encodedFile, "base64");
      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json({ message: "File exceeds the 50MB download limit." }, { status: 413 });
      }
      file = new Uint8Array(buffer);
      contentType = dataUrl[1];
    } else {
      let fileUrl: URL;
      try {
        fileUrl = new URL(item.fileUrl);
      } catch {
        return NextResponse.json({ message: "Stored file URL is invalid." }, { status: 400 });
      }
      if (fileUrl.protocol !== "https:" || fileUrl.hostname !== "res.cloudinary.com") {
        return NextResponse.json({ message: "Unsupported file storage provider." }, { status: 400 });
      }

      const upstream = await fetch(fileUrl, { redirect: "manual" });
      if (!upstream.ok || !upstream.body) {
        console.error("ORDER FILE DOWNLOAD ERROR:", upstream.status, id, itemIndex);
        return NextResponse.json({ message: "Could not retrieve the uploaded file." }, { status: 502 });
      }
      const contentLength = Number(upstream.headers.get("content-length"));
      if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE) {
        return NextResponse.json({ message: "File exceeds the 50MB download limit." }, { status: 413 });
      }
      const buffer = await upstream.arrayBuffer();
      if (buffer.byteLength > MAX_FILE_SIZE) {
        return NextResponse.json({ message: "File exceeds the 50MB download limit." }, { status: 413 });
      }
      file = new Uint8Array(buffer);
      contentType = upstream.headers.get("content-type")?.split(";")[0] || contentType;
    }

    const filename = makeDownloadName(item.productName || "design", item.fileUrl, contentType);
    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename.replace(/[^\x20-\x7e]|["\\]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Content-Length": String(file.byteLength),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });

    const body = new ArrayBuffer(file.byteLength);
    new Uint8Array(body).set(file);
    return new Response(body, { headers });
  } catch (error) {
    console.error("DOWNLOAD ORDER FILE ERROR:", error);
    return NextResponse.json({ message: "Could not download order file." }, { status: 500 });
  }
}
