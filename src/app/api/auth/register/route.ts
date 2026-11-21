import { NextResponse } from "next/server";
import { dataStore } from "@/lib/services/data-store";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Podaj prawidłowy adres e-mail i hasło." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Hasło musi mieć co najmniej 6 znaków." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await dataStore.findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: "Użytkownik o podanym adresie e-mail już istnieje." },
        { status: 409 }
      );
    }

    const user = await dataStore.createUser({
      email: cleanEmail,
      password,
      name: name?.trim() || null,
      role: "USER",
    });

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas rejestracji konta." },
      { status: 500 }
    );
  }
}
