import { NextResponse } from "next/server";
import { dataStore } from "@/lib/services/data-store";

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

    const savedLead = await dataStore.createContactLead({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      storeUrl: storeUrl ? storeUrl.trim() : null,
      monthlyOrders: monthlyOrders || "Nie określono",
      message: message ? message.trim() : "",
    });

    if (process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFY_EMAIL) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "BaseDoctor <onboarding@resend.dev>",
            to: [process.env.CONTACT_NOTIFY_EMAIL],
            subject: `Nowy wniosek o audyt BaseDoctor: ${savedLead.name}`,
            text: `Imię/Firma: ${savedLead.name}\nEmail: ${savedLead.email}\nSklep: ${savedLead.storeUrl || "-"}\nZamówienia/msc: ${savedLead.monthlyOrders || "-"}\nWiadomość: ${savedLead.message || "-"}`,
          }),
        });
      } catch (mailErr) {
        console.error("Resend notification error:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Dziękujemy! Twój wniosek o bezpłatny audyt wstępny został pomyślnie przyjęty. Skontaktujemy się w ciągu 24 godzin.",
      lead: {
        id: savedLead.id,
        email: savedLead.email,
        name: savedLead.name,
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
