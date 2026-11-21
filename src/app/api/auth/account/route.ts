import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dataStore } from "@/lib/services/data-store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  try {
    const exported = await dataStore.exportUserData(user.id);
    if (!exported) {
      return NextResponse.json({ error: "Nie znaleziono konta" }, { status: 404 });
    }

    return new NextResponse(JSON.stringify(exported, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="basedoctor-rodo-export-${user.id}.json"`,
      },
    });
  } catch (err) {
    console.error("RODO export error:", err);
    return NextResponse.json({ error: "Błąd podczas eksportu danych" }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  try {
    await dataStore.deleteUserAccount(user.id);
    const response = NextResponse.json({
      success: true,
      message: "Konto i wszystkie powiązane dane zostały trwale usunięte zgodnie z Art. 17 RODO.",
    });
    response.cookies.delete("basedoctor_session");
    return response;
  } catch (err) {
    console.error("RODO delete account error:", err);
    return NextResponse.json({ error: "Błąd podczas usuwania konta" }, { status: 500 });
  }
}
