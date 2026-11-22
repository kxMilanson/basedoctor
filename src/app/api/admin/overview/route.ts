import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dataStore } from "@/lib/services/data-store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Odmowa dostępu. Wymagane uprawnienia administratora." },
      { status: 403 }
    );
  }

  const [stats, users, leads] = await Promise.all([
    dataStore.getAdminStats(),
    dataStore.getAllUsers(),
    dataStore.getContactLeads(),
  ]);

  return NextResponse.json({
    stats,
    users,
    leads,
  });
}
