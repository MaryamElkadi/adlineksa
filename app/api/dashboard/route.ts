import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Quotation from "@/models/Quotation";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const [orders, quotations, productsCount, categoriesCount, users] =
      await Promise.all([
        Order.find({}).sort({ createdAt: -1 }).lean(),
        Quotation.find({}).sort({ createdAt: -1 }).lean(),
        Product.countDocuments({}),
        Category.countDocuments({}),
        User.find({}).sort({ createdAt: -1 }).lean(),
      ]);

    const totalRevenue = orders.reduce(
      (sum: number, order: any) => sum + (order.total || 0),
      0
    );

    const pendingOrders = orders.filter(
      (order: any) => order.status === "Pending"
    ).length;

    const pendingQuotations = quotations.filter(
      (q: any) => q.status === "Pending" || q.status === "قيد الدراسة"
    ).length;

    const stats = [
      {
        label: "إجمالي المبيعات",
        value: `${totalRevenue.toLocaleString("ar-SA")} ر.س`,
        change: "+12.5%",
      },
      {
        label: "إجمالي الطلبات",
        value: orders.length.toString(),
        change: "+8.2%",
      },
      {
        label: "طلبات التسعير",
        value: quotations.length.toString(),
        change: "+4.1%",
      },
      {
        label: "العملاء المسجلون",
        value: users.length.toString(),
        change: "+15.0%",
      },
    ];

    const formattedOrders = orders.map((ord: any) => ({
      _id: ord._id.toString(),
      id: ord._id.toString(),
      orderNumber: ord.orderNumber || `ORD-${ord._id.toString().slice(-4)}`,
      customer: {
        fullName: ord.customer?.fullName || "عميل زائر",
        email: ord.customer?.email || "",
        phone: ord.customer?.phone || "",
      },
      items: (ord.items || []).map((item: any) => ({
        productId: item.productId || "",
        productName: item.productName || "منتج طباعة",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
      })),
      total: ord.total || 0,
      status: ord.status || "Pending",
      createdAt: ord.createdAt
        ? new Date(ord.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    const formattedUsers = users.map((u: any) => {
      const userOrders = orders.filter(
        (o: any) => o.userId?.toString() === u._id.toString()
      );
      const userSpent = userOrders.reduce(
        (sum: number, o: any) => sum + (o.total || 0),
        0
      );

      return {
        _id: u._id.toString(),
        id: u._id.toString(),
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        fullName: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "بدون اسم",
        email: u.email || "",
        phone: u.phone || "",
        role: u.role || "user",
        isActive: u.isActive !== undefined ? u.isActive : true,
        ordersCount: userOrders.length,
        totalSpent: userSpent,
        createdAt: u.createdAt
          ? new Date(u.createdAt).toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      stats,
      allOrders: formattedOrders,
      recentOrders: formattedOrders.slice(0, 10),
      allUsers: formattedUsers,
      recentQuotations: quotations.slice(0, 10),
      products: productsCount,
      categories: categoriesCount,
      orders: orders.length,
      quotations: quotations.length,
      users: users.length,
      pendingOrders,
      pendingQuotations,
      revenue: totalRevenue,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to load dashboard data",
      },
      { status: 500 }
    );
  }
}
