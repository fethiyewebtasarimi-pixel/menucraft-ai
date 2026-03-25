import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map((val) => escape(String(val ?? ""))).join(",")),
  ];
  return "\uFEFF" + lines.join("\n"); // BOM for Excel Turkish char support
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { type } = await params;
    let csv = "";
    let filename = "";

    switch (type) {
      case "users": {
        const users = await prisma.user.findMany({
          include: {
            subscription: { select: { plan: true, status: true } },
            _count: { select: { restaurants: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        const headers = ["Ad", "E-posta", "Telefon", "Rol", "Plan", "Durum", "Restoran Sayısı", "Kayıt Tarihi"];
        const rows = users.map((u) => [
          u.name,
          u.email,
          u.phone || "",
          u.role,
          u.subscription?.plan || "FREE",
          u.subscription?.status || "ACTIVE",
          String(u._count.restaurants),
          new Date(u.createdAt).toLocaleDateString("tr-TR"),
        ]);
        csv = toCSV(headers, rows);
        filename = `kullanicilar_${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }

      case "orders": {
        const orders = await prisma.order.findMany({
          include: {
            restaurant: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5000,
        });
        const headers = ["Sipariş No", "Restoran", "Müşteri", "Toplam", "Durum", "Ödeme", "Tarih"];
        const rows = orders.map((o) => [
          o.orderNumber,
          o.restaurant.name,
          o.customerName || "Misafir",
          String(o.totalAmount),
          o.status,
          o.paymentStatus,
          new Date(o.createdAt).toLocaleDateString("tr-TR"),
        ]);
        csv = toCSV(headers, rows);
        filename = `siparişler_${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }

      case "subscriptions": {
        const subs = await prisma.subscription.findMany({
          include: {
            user: { select: { name: true, email: true } },
          },
          orderBy: { updatedAt: "desc" },
        });
        const headers = ["Kullanıcı", "E-posta", "Plan", "Durum", "AI Kredi", "Kullanılan", "Bitiş Tarihi"];
        const rows = subs.map((s) => [
          s.user.name,
          s.user.email,
          s.plan,
          s.status,
          String(s.aiCredits),
          String(s.aiCreditsUsed),
          s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("tr-TR") : "-",
        ]);
        csv = toCSV(headers, rows);
        filename = `abonelikler_${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }

      case "restaurants": {
        const restaurants = await prisma.restaurant.findMany({
          include: {
            user: { select: { name: true, email: true } },
            _count: { select: { orders: true, reviews: true, menuItems: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        const headers = ["Restoran", "Sahibi", "E-posta", "Şehir", "Sipariş", "Yorum", "Ürün", "Aktif", "Tarih"];
        const rows = restaurants.map((r) => [
          r.name,
          r.user.name,
          r.user.email,
          r.city || "-",
          String(r._count.orders),
          String(r._count.reviews),
          String(r._count.menuItems),
          r.isActive ? "Evet" : "Hayır",
          new Date(r.createdAt).toLocaleDateString("tr-TR"),
        ]);
        csv = toCSV(headers, rows);
        filename = `restoranlar_${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }

      default:
        return NextResponse.json({ error: "Geçersiz export tipi" }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[ADMIN_EXPORT]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
