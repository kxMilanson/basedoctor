import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dataStore } from "@/lib/services/data-store";
import { decryptToken } from "@/lib/crypto";
import { BaseComClient } from "@/lib/base-com/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const connection = await dataStore.getConnectionById(params.id, user.id);
  if (!connection) {
    return NextResponse.json(
      { error: "Nie odnaleziono wskazanego połączenia." },
      { status: 404 }
    );
  }

  const plainToken = decryptToken({
    ciphertext: connection.encryptedToken,
    iv: connection.tokenIv,
    tag: connection.tokenTag,
  });

  if (plainToken.startsWith("demo_") || plainToken === "test_token") {
    return NextResponse.json({
      success: true,
      message: "Połączenie demonstracyjne aktywne (tryb offline fixtures).",
      details: { inventoriesCount: 1, statusesCount: 6 },
    });
  }

  try {
    const client = new BaseComClient({ token: plainToken });
    const result = await client.testConnection();

    return NextResponse.json({
      success: true,
      message: "Połączenie z oficjalnym API Base.com nawiązane pomyślnie!",
      details: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Błąd testu połączenia: ${err.message}`,
      },
      { status: 400 }
    );
  }
}
