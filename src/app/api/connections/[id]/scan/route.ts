import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { DiagnosticService } from "@/lib/services/diagnostic-service";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  try {
    const report = await DiagnosticService.executeScan(params.id, user.id);
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("Diagnostic Scan Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Wystąpił błąd podczas wykonywania skanu diagnostycznego.",
      },
      { status: 500 }
    );
  }
}
