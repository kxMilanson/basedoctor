import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dataStore } from "@/lib/services/data-store";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const scan = await dataStore.getScanById(params.id, user.id);
  if (!scan) {
    return NextResponse.json(
      { error: "Nie odnaleziono wskazanego raportu ze skanu." },
      { status: 404 }
    );
  }

  return NextResponse.json({ scan });
}
