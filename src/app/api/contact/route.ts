import { NextResponse } from "next/server";

export interface ContactLeadInput {
  name: string;
  email: string;
  storeUrl?: string;
  monthlyOrders?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const body: ContactLeadInput = await request.json();
    const { name, email, storeUrl, monthlyOrders, message } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Podaj swoje imię i nazwisko lub nazwę firmy." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Wprowadź prawidłowy adres e-mail." },
        { status: 400 }
      );
    }

    const leadRecord = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      storeUrl: storeUrl ? storeUrl.trim() : null,
      monthlyOrders: monthlyOrders || "Nie określono",
      message: message ? message.trim() : "",
      receivedAt: new Date().toISOString(),
    };

    // In production, send notification email / slack webhook / CRM insertion.
    // For MVP beta release, we log the lead safely without storing sensitive credentials.
    console.log("=== NOWY WNIOSEK O AUDYT / LEAD BAZEDOCTOR ===", leadRecord);

    return NextResponse.json({
      success: true,
      message: "Dziękujemy! Twój wniosek o bezpłatny audyt wstępny został pomyślnie przyjęty. Skontaktujemy się w ciągu 24 godzin.",
      lead: {
        email: leadRecord.email,
        name: leadRecord.name,
      },
    });
  } catch (error: any) {
    console.error("Contact Form Submission Error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie później." },
      { status: 500 }
    );
  }
}
