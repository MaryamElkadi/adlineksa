import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

import Product from "@/models/Product";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Quotation from "@/models/Quotation";

export async function GET() {
  try {
    await connectToDatabase();

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

    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$total",
          },
        },
      },
    ]);

    const revenue =
      revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentQuotations = await Quotation.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      stats: [
        {
          label: "إجمالي الإيرادات",
          value: `${revenue} ر.س`,
          change: "+0%",
        },
        {
          label: "إجمالي الطلبات",
          value: orders.toString(),
          change: "+0%",
        },
        {
          label: "طلبات التسعير",
          value: quotations.toString(),
          change: "+0%",
        },
        {
          label: "المنتجات",
          value: products.toString(),
          change: "+0%",
        },
      ],

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
        message: "Failed to load dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}