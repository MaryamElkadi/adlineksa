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

// Create an order for either a signed-in user or a guest.
export async function POST(request: Request) {
  const reservedProducts: Array<{ productId: string; quantity: number }> = [];
  try {
    const currentUser = await getCurrentUser();

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !Array.isArray(body.items) ||
      !body.items.length ||
      typeof body.customer?.fullName !== "string" ||
      !body.customer.fullName.trim() ||
      typeof body.customer?.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer.email.trim()) ||
      typeof body.customer?.phone !== "string" ||
      !body.customer.phone.trim() ||
      typeof body.shippingAddress !== "string" ||
      !body.shippingAddress.trim() ||
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
      .select("pricingType basePrice configurableQuantityTiers quantityTiers minQuantity maxQuantity colorSelectionMode colors configurableDesignPlacements configurablePrintSides configurableLighting installationAvailable installationFee designFee configurableMaterials configurableSizes configurableFinishes active")
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
        (product.configurableQuantityTiers?.length
          ? !product.configurableQuantityTiers.some((tier: { quantity: number }) => tier.quantity === item.quantity)
          : !(product.quantityTiers || []).includes(item.quantity))
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

      if (
        product.configurableDesignPlacements?.length &&
        !product.configurableDesignPlacements.some((option: { label: string }) => option.label === item.designPlacement)
      ) {
        return NextResponse.json({ message: "اختاري مكان التصميم المتاح لهذا المنتج." }, { status: 400 });
      }

      if (
        product.configurablePrintSides?.length &&
        !product.configurablePrintSides.some((option: { label: string }) => option.label === item.printSide)
      ) {
        return NextResponse.json({ message: "اختاري وجه طباعة متاحاً لهذا المنتج." }, { status: 400 });
      }

      if (
        product.configurableLighting?.length &&
        !product.configurableLighting.some((option: { label: string }) => option.label === item.lighting)
      ) {
        return NextResponse.json({ message: "اختاري إضاءة متاحة لهذا المنتج." }, { status: 400 });
      }

      if (
        product.configurableMaterials?.length &&
        !product.configurableMaterials.some((option: { label: string }) => option.label === item.material)
      ) {
        return NextResponse.json({ message: "اختاري خامة متاحة لهذا المنتج." }, { status: 400 });
      }

      if (
        product.configurableSizes?.length &&
        !product.configurableSizes.some((option: { label: string }) => option.label === item.size)
      ) {
        return NextResponse.json({ message: "اختاري مقاساً متاحاً لهذا المنتج." }, { status: 400 });
      }

      if (
        product.configurableFinishes?.length &&
        !product.configurableFinishes.some((option: { label: string }) => option.label === item.finish)
      ) {
        return NextResponse.json({ message: "اختاري تشطيباً متاحاً لهذا المنتج." }, { status: 400 });
      }

      if (item.installation && !product.installationAvailable) {
        return NextResponse.json({ message: "خدمة التركيب غير متاحة لهذا المنتج." }, { status: 400 });
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

    const verifiedItems = body.items.map((item: {
      productId: string;
      quantity: number;
      pricingType?: string;
      needDesign?: boolean;
      installation?: boolean;
      designPlacement?: string;
      finish?: string;
      printSide?: string;
      lighting?: string;
      material?: string;
      size?: string;
    }) => {
      const product = productsById.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} disappeared during order validation.`);

      const hasTiers = Boolean(product.configurableQuantityTiers?.length || product.quantityTiers?.length);
      const pricingType = product.pricingType || (hasTiers ? "tiered" : "quantity");
      const tier = product.configurableQuantityTiers?.find(
        (option: { quantity: number }) => option.quantity === item.quantity
      );
      const tierPrice = pricingType === "tiered"
        ? (tier?.unitPrice ?? product.basePrice ?? 0) * (1 - Math.min(100, Math.max(0, tier?.discountPercent || 0)) / 100)
        : (product.basePrice || 0) * item.quantity;
      const findModifier = (options: Array<{ label: string; priceModifier: number }> | undefined, label: string | undefined) =>
        options?.find((option) => option.label === label)?.priceModifier || 0;
      const placementFee = findModifier(product.configurableDesignPlacements, item.designPlacement);
      const printSideFee = product.configurablePrintSides?.find(
        (option: { label: string; priceModifier: number }) => option.label === item.printSide
      )?.priceModifier || 0;
      const lightingFee = findModifier(product.configurableLighting, item.lighting);
      const optionFees =
        findModifier(product.configurableMaterials, item.material) +
        findModifier(product.configurableSizes, item.size) +
        findModifier(product.configurableFinishes, item.finish) +
        placementFee +
        printSideFee +
        lightingFee +
        (item.installation ? product.installationFee || 0 : 0) +
        (item.needDesign ? product.designFee || 75 : 0);
      const totalPrice = Math.round(Math.max(0, tierPrice + optionFees) * 100) / 100;
      return {
        ...item,
        pricingType: item.pricingType || product.pricingType || (hasTiers ? "tiered" : "quantity"),
        unitPrice: Math.round((totalPrice / item.quantity) * 100) / 100,
        totalPrice,
      };
    });
    const subtotal = verifiedItems.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0);
    const orderTotal = Math.round((subtotal + subtotal * 0.15) * 100) / 100;

    const order = await Order.create({
      ...body,
      items: verifiedItems,
      total: orderTotal,
      shippingCost: null,

      // IMPORTANT
      ...(currentUser ? { userId: currentUser._id } : {}),

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