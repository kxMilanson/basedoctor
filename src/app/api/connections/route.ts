import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dataStore } from "@/lib/services/data-store";
import { BaseComClient } from "@/lib/base-com/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const connections = await dataStore.getUserConnections(user.id);
  return NextResponse.json({ connections });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, token, testBeforeSave } = body;

    if (!name || !token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Podaj nazwę połączenia oraz ważny token API Base.com." },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();

    // Optionally test connection with Base.com connector (unless demo token)
    if (testBeforeSave && !cleanToken.startsWith("demo_") && cleanToken !== "test_token") {
      try {
        const client = new BaseComClient({ token: cleanToken });
        await client.testConnection();
      } catch (connErr: any) {
        return NextResponse.json(
          {
            error: `Weryfikacja tokenu nie powiodła się: ${connErr.message}`,
          },
          { status: 400 }
        );
      }
    }

    const connection = await dataStore.createConnection(user.id, name.trim(), cleanToken);

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        name: connection.name,
        status: connection.status,
        createdAt: connection.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Create Connection Error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas zapisywania połączenia ze sklepem." },
      { status: 500 }
    );
  }
}
