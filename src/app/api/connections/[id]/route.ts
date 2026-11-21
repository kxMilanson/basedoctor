import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dataStore } from "@/lib/services/data-store";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  try {
    const result = await dataStore.deleteConnection(params.id, user.id);
    if (!result || (typeof result === "object" && "count" in result && result.count === 0)) {
      return NextResponse.json(
        { error: "Nie znaleziono wskazanego połączenia lub brak uprawnień." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Połączenie zostało pomyślnie usunięte.",
    });
  } catch (error: any) {
    console.error("Delete Connection Error:", error);
    return NextResponse.json(
      { error: "Błąd podczas usuwania połączenia." },
      { status: 500 }
    );
  }
}
