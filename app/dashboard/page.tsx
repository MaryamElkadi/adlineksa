import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";

import Product from "@/models/Product";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Quotation from "@/models/Quotation";

export async function GET() {
  try {
    await connectToDatabase();

    // ==========================
    // Statistics
    // ==========================

    const products = await Product.countDocuments();

    const categories = await Category.countDocuments();

    const orders = await Order.countDocuments();

    const quotations = await Quotation.countDocuments();

    const pendingOrders = await Order.countDocuments({
      status: "Pending",
    });

    const pendingQuotations = await Quotation.countDocuments({
      status: "Pending",
    });

    // ==========================
    // Revenue
    // ==========================

    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$total",
          },
        },
      },
    ]);

    const revenue =
      revenueResult.length > 0 ? revenueResult[0].revenue : 0;

    // ==========================
    // Recent Orders
    // ==========================

    const recentOrders = await Order.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    // ==========================
    // Recent Quotations
    // ==========================

    const recentQuotations = await Quotation.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    // ==========================
    // Dashboard Cards
    // ==========================

    const stats = [
      {
        label: "المنتجات",
        value: products.toString(),
        change: "",
      },
      {
        label: "الفئات",
        value: categories.toString(),
        change: "",
      },
      {
        label: "طلبات الشراء",
        value: orders.toString(),
        change: "",
      },
      {
        label: "طلبات التسعير",
        value: quotations.toString(),
        change: "",
      },
    ];

    return NextResponse.json({
      stats,

      products,

      categories,

      orders,

      quotations,

      pendingOrders,

      pendingQuotations,

      revenue,

      recentOrders,

      recentQuotations,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to load dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}