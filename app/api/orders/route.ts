import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/currentUser";
import { ensureInitialCatalog } from "@/lib/seed";

export const dynamic = "force-dynamic";

async function restoreReservedStock(reservedProducts: Array<{ productId: string; quantity: number }>) {
  const heldProducts = reservedProducts.splice(0);
  for (const held of heldProducts) {
    try {
      await Product.updateOne({ _id: held.productId }, { $inc: { stock: held.quantity } });
    } catch (error) {
      console.error(`Could not restore stock for product ${held.productId}`, error);
    }
  }
}

function serializeOrder(order: any) {
  const value = order.toObject ? order.toObject() : order;

  return {
    ...value,
    _id: value._id.toString(),
    id: value._id.toString(),
    date: value.createdAt
      ? new Date(value.createdAt).toISOString().slice(0, 10)
      : "",
    itemsCount: value.items?.length || 0,
  };
}

// GET ORDERS (Support Admin all orders & filtering)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    await ensureInitialCatalog();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true" || searchParams.get("all") === "true";
    const statusFilter = searchParams.get("status") || "";
    const searchFilter = searchParams.get("search") || "";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    if (isAdmin && currentUser.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const query: any = {};

    if (!isAdmin) {
      query.userId = currentUser._id;
    }

    if (statusFilter && statusFilter !== "all" && statusFilter !== "الكل") {
      query.status = statusFilter;
    }

    if (searchFilter) {
      const searchRegex = new RegExp(searchFilter, "i");
      query.$or = [
        { orderNumber: searchRegex },
        { "customer.fullName": searchRegex },
        { "customer.email": searchRegex },
        { "customer.phone": searchRegex },
      ];
    }

    const page = pageParam ? parseInt(pageParam, 10) : 0;
    const limit = limitParam ? parseInt(limitParam, 10) : 0;

    if (page > 0 && limit > 0) {
      const total = await Order.countDocuments(query);
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const formattedOrders = orders.map((order: any) => ({
        ...order,
        _id: order._id.toString(),
        id: order._id.toString(),
        date: order.createdAt
          ? new Date(order.createdAt).toISOString().slice(0, 10)
          : "",
        itemsCount: order.items?.length || 0,
      }));

      return NextResponse.json({
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      orders.map((order: any) => ({
        ...order,
        _id: order._id.toString(),
        id: order._id.toString(),
        date: order.createdAt
          ? new Date(order.createdAt).toISOString().slice(0, 10)
          : "",
        itemsCount: order.items?.length || 0,
      }))
    );
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      { message: "Could not load orders" },
      { status: 500 }
    );
  }
}

// CREATE ORDER FOR CURRENT USER
export async function POST(request: Request) {
  const reservedProducts: Array<{ productId: string; quantity: number }> = [];
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !Array.isArray(body.items) ||
      !body.items.length ||
      !body.customer?.fullName ||
      !body.customer?.email ||
      !body.customer?.phone ||
      !body.shippingAddress ||
      !body.paymentMethod
    ) {
      return NextResponse.json(
        {
          message:
            "Complete customer, shipping, payment, and item details are required.",
        },
        { status: 400 }
      );
    }

    const requestedQuantities = new Map<string, number>();
    for (const item of body.items) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.productId !== "string" ||
        !/^[a-f\d]{24}$/i.test(item.productId) ||
        !Number.isFinite(item.quantity) ||
        !["quantity", "tiered", "meter"].includes(item.pricingType || "quantity") ||
        (item.pricingType === "meter"
          ? item.quantity < 0.01
          : item.quantity < 1 || !Number.isInteger(item.quantity))
      ) {
        return NextResponse.json({ message: "One or more product quantities are invalid." }, { status: 400 });
      }
      requestedQuantities.set(
        item.productId,
        (requestedQuantities.get(item.productId) || 0) + item.quantity
      );
    }

    await connectToDatabase();

    const products = await Product.find({ _id: { $in: [...requestedQuantities.keys()] } })
      .select("pricingType configurableQuantityTiers quantityTiers minQuantity maxQuantity colorSelectionMode colors active")
      .lean();
    const productsById = new Map(products.map((product) => [String(product._id), product]));

    for (const item of body.items) {
      const product = productsById.get(item.productId);
      if (!product || product.active === false) {
        await restoreReservedStock(reservedProducts);
        return NextResponse.json({ message: "أحد المنتجات لم يعد متاحاً." }, { status: 409 });
      }

      const hasTiers = Boolean(product.configurableQuantityTiers?.length || product.quantityTiers?.length);
      const pricingType = product.pricingType || (hasTiers ? "tiered" : "quantity");
      const requestedPricingType = item.pricingType || (product.pricingType ? "quantity" : pricingType);
      if (requestedPricingType !== pricingType) {
        return NextResponse.json({ message: "طريقة تسعير أحد المنتجات تغيرت. حدّثي السلة وحاولي مرة أخرى." }, { status: 409 });
      }

      if (
        pricingType === "tiered" &&
        !(product.configurableQuantityTiers || []).some((tier: { quantity: number }) => tier.quantity === item.quantity) &&
        !(product.quantityTiers || []).includes(item.quantity)
      ) {
        return NextResponse.json({ message: "اختاري إحدى شرائح الكمية المتاحة لهذا المنتج." }, { status: 400 });
      }

      const minimum = pricingType === "meter" ? 0.01 : Math.max(1, product.minQuantity || 1);
      if (item.quantity < minimum || (product.maxQuantity && item.quantity > product.maxQuantity)) {
        return NextResponse.json({ message: "الكمية المطلوبة خارج الحدود المسموح بها لهذا المنتج." }, { status: 400 });
      }

      if (
        product.colorSelectionMode === "custom" &&
        (typeof item.colorHex !== "string" || !/^#[0-9a-f]{6}$/i.test(item.colorHex) || item.color !== item.colorHex)
      ) {
        return NextResponse.json({ message: "اختاري لوناً صحيحاً من لوحة الألوان." }, { status: 400 });
      }

      if (
        product.colorSelectionMode !== "custom" &&
        product.colors?.length &&
        !product.colors.some((color: { label: string; hex: string }) => color.label === item.color && color.hex === item.colorHex)
      ) {
        return NextResponse.json({ message: "اختاري لوناً متاحاً لهذا المنتج." }, { status: 400 });
      }
    }

    for (const [productId, quantity] of requestedQuantities) {
      const reserved = await Product.findOneAndUpdate(
        { _id: productId, active: { $ne: false }, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { returnDocument: "after" }
      ).select("_id");

      if (!reserved) {
        await restoreReservedStock(reservedProducts);
        return NextResponse.json(
          { message: "المخزون غير كافٍ لأحد المنتجات. حدّثي السلة وحاولي مرة أخرى." },
          { status: 409 }
        );
      }
      reservedProducts.push({ productId, quantity });
    }

    const order = await Order.create({
      ...body,
      items: body.items.map((item: { productId: string; pricingType?: string }) => {
        const product = productsById.get(item.productId);
        const hasTiers = Boolean(product?.configurableQuantityTiers?.length || product?.quantityTiers?.length);
        return {
          ...item,
          pricingType: item.pricingType || product?.pricingType || (hasTiers ? "tiered" : "quantity"),
        };
      }),

      // IMPORTANT
      userId: currentUser._id,

      orderNumber: `ADL-${Date.now()
        .toString()
        .slice(-8)}`,

      status: "Pending",
    });

    return NextResponse.json(
      serializeOrder(order),
      { status: 201 }
    );
  } catch (error) {
    await restoreReservedStock(reservedProducts);
    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      { message: "Could not create order" },
      { status: 500 }
    );
  }
}