import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dataStore } from "@/lib/services/data-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { issueId, newValue, fieldName, oldValue, action } = body;

    if (!issueId) {
      return NextResponse.json(
        { error: "Brak identyfikatora problemu." },
        { status: 400 }
      );
    }

    if (action === "ROLLBACK") {
      const updatedScan = await dataStore.rollbackIssueFix(
        params.id,
        user.id,
        String(issueId)
      );
      if (!updatedScan) {
        return NextResponse.json(
          { error: "Nie znaleziono wskazanego raportu lub problemu." },
          { status: 404 }
        );
      }
      return NextResponse.json({ scan: updatedScan });
    }

    if (!newValue || !fieldName) {
      return NextResponse.json(
        { error: "Podaj nową wartość oraz nazwę pola do poprawy." },
        { status: 400 }
      );
    }

    const updatedScan = await dataStore.applyIssueFix(
      params.id,
      user.id,
      String(issueId),
      String(newValue),
      String(fieldName),
      oldValue ? String(oldValue) : undefined
    );

    if (!updatedScan) {
      return NextResponse.json(
        { error: "Nie znaleziono wskazanego raportu lub problemu." },
        { status: 404 }
      );
    }

    return NextResponse.json({ scan: updatedScan });
  } catch (err) {
    console.error("Fix endpoint error:", err);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas zapisywania poprawki." },
      { status: 500 }
    );
  }
}
