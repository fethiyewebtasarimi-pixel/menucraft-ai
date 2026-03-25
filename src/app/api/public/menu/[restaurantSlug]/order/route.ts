import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validations/order";
import { generateOrderNumber } from "@/lib/utils";
import { publicLimiter, getClientIp } from "@/lib/rate-limit";
import { notifyNewOrder } from "@/lib/notifications";

/**
 * POST /api/public/menu/[restaurantSlug]/order
 * Create order from customer (NO AUTH REQUIRED)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantSlug: string } }
) {
  try {
    const ip = getClientIp(req);
    const { success } = await publicLimiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug: params.restaurantSlug,
        isActive: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = createOrderSchema.parse(body);

    // Validate all menu items exist and calculate totals
    const menuItemIds = validatedData.items.map((item) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json(
        { error: "Some menu items are not available" },
        { status: 400 }
      );
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = validatedData.items.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new Error("Menu item not found");
      }

      const unitPrice = Number(menuItem.price);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        totalPrice: itemTotal,
        notes: item.notes,
        modifiers: item.modifiers,
      };
    });

    // Calculate tax (KDV 10%)
    const taxAmount = subtotal * 0.10;
    const totalAmount = subtotal + taxAmount;

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let orderExists = await prisma.order.findFirst({
      where: {
        restaurantId: restaurant.id,
        orderNumber,
      },
    });

    while (orderExists) {
      orderNumber = generateOrderNumber();
      orderExists = await prisma.order.findFirst({
        where: {
          restaurantId: restaurant.id,
          orderNumber,
        },
      });
    }

    // Validate table if provided
    if (validatedData.tableId) {
      const table = await prisma.table.findUnique({
        where: { id: validatedData.tableId },
      });

      if (!table || table.restaurantId !== restaurant.id) {
        return NextResponse.json(
          { error: "Invalid table" },
          { status: 400 }
        );
      }
    }

    // Create order and update analytics atomically in a transaction
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const order = await prisma.$transaction(async (tx) => {
      // Create order with items
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          restaurantId: restaurant.id,
          tableId: validatedData.tableId,
          type: validatedData.type,
          status: "PENDING",
          subtotal,
          taxAmount,
          totalAmount,
          customerName: validatedData.customerName,
          customerPhone: validatedData.customerPhone,
          customerEmail: validatedData.customerEmail,
          customerNote: validatedData.customerNote,
          items: {
            createMany: {
              data: orderItems,
            },
          },
        },
        include: {
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                  image: true,
                },
              },
            },
          },
          table: {
            select: {
              id: true,
              number: true,
              name: true,
            },
          },
        },
      });

      // Update analytics within the same transaction
      await tx.analytics.upsert({
        where: {
          restaurantId_date: {
            restaurantId: restaurant.id,
            date: today,
          },
        },
        update: {
          totalOrders: { increment: 1 },
          totalRevenue: { increment: totalAmount },
        },
        create: {
          restaurantId: restaurant.id,
          date: today,
          menuViews: 0,
          qrScans: 0,
          uniqueVisitors: 0,
          totalOrders: 1,
          totalRevenue: totalAmount,
        },
      });

      return newOrder;
    });

    // Send notification to restaurant owner (non-blocking)
    notifyNewOrder(
      restaurant.userId,
      orderNumber,
      restaurant.name,
      totalAmount
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("[PUBLIC_ORDER_POST]", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
