import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dataStore } from "@/lib/services/data-store";
import { generateScanReportPdf } from "@/lib/reports/pdf";
import { DiagnosticScanReport } from "@/types";

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
      { error: "Nie odnaleziono wskazanego raportu." },
      { status: 404 }
    );
  }

  const reportData: DiagnosticScanReport = {
    id: scan.id,
    shopConnectionId: scan.shopConnectionId,
    shopName: scan.shopConnection?.name || "Sklep Base.com",
    startedAt: scan.startedAt ? new Date(scan.startedAt).toISOString() : new Date().toISOString(),
    completedAt: scan.completedAt ? new Date(scan.completedAt).toISOString() : new Date().toISOString(),
    healthScore: scan.healthScore,
    productsScanned: scan.productsScanned,
    ordersScanned: scan.ordersScanned,
    issuesCount: scan.issuesCount,
    criticalCount: scan.criticalCount,
    warningCount: scan.warningCount,
    infoCount: scan.infoCount,
    categories: (scan.summary as any) || [],
    issues: scan.issues || [],
  };

  const pdfBuffer = await generateScanReportPdf(reportData);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="BaseDoctor_Raport_${scan.id}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
