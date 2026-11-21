import PDFDocument from "pdfkit";
import { DiagnosticScanReport } from "@/types";

/**
 * Generates a PDF buffer for a DiagnosticScanReport using PDFKit.
 */
export async function generateScanReportPdf(
  report: DiagnosticScanReport
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        info: {
          Title: `BaseDoctor_Raport_${report.shopName}_${report.completedAt.slice(0, 10)}`,
          Author: "BaseDoctor SaaS",
          Subject: "Raport diagnostyczny Base.com",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Header branding
      doc.fillColor("#1e40af").fontSize(22).text("BaseDoctor");
      doc
        .fillColor("#64748b")
        .fontSize(10)
        .text("Platforma Diagnostyczna dla E-commerce & Base.com");

      doc.moveDown(0.5);
      doc
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .moveTo(40, doc.y)
        .lineTo(555, doc.y)
        .stroke();
      doc.moveDown(0.8);

      // Report Info
      doc.fillColor("#0f172a").fontSize(16).text("Oficjalny Audyt i Raport Diagnostyczny");
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor("#334155");
      doc.text(`Sklep: ${report.shopName}`);
      doc.text(`Data wykonania: ${new Date(report.completedAt).toLocaleString("pl-PL")}`);
      doc.text(
        `Źródło danych: ${
          report.dataSource === "DEMO_FIXTURES"
            ? "Środowisko testowe (Fixtures demo)"
            : "Oficjalne API Base.com (Tryb na żywo)"
        }`
      );
      doc.text(`Zbadane produkty: ${report.productsScanned} szt.  |  Zbadane zamówienia: ${report.ordersScanned} szt.`);
      doc.moveDown(0.8);

      // Health Score Box
      const scoreColor =
        report.healthScore >= 80
          ? "#16a34a"
          : report.healthScore >= 50
          ? "#d97706"
          : "#dc2626";

      doc.rect(40, doc.y, 515, 55).fillAndStroke("#f8fafc", "#cbd5e1");
      const boxY = doc.y - 55;

      doc.fillColor(scoreColor).fontSize(24).text(`${report.healthScore}%`, 55, boxY + 12);
      doc.fillColor("#0f172a").fontSize(12).text("Wskaźnik Kondycji Sklepu (Health Score)", 135, boxY + 12);
      doc.fontSize(9).fillColor("#64748b").text(
        `Wykryte usterki: ${report.criticalCount} krytycznych, ${report.warningCount} ostrzeżeń, ${report.infoCount} informacyjnych`,
        135,
        boxY + 30
      );

      doc.y = boxY + 70;
      doc.moveDown(0.5);

      // Category Scores Summary
      doc.fillColor("#0f172a").fontSize(13).text("Podsumowanie Kategorii");
      doc.moveDown(0.3);

      report.categories.forEach((cat) => {
        const catColor = cat.score >= 80 ? "#16a34a" : cat.score >= 50 ? "#d97706" : "#dc2626";
        doc.fontSize(9).fillColor("#1e293b");
        doc.text(`• ${cat.title}: `, { continued: true });
        doc.fillColor(catColor).text(`${cat.score}/100 `, { continued: true });
        doc.fillColor("#64748b").text(`(${cat.criticalCount} krytycznych, ${cat.warningCount} ostrzeżeń)`);
      });

      doc.moveDown(1);
      doc.fillColor("#0f172a").fontSize(13).text("Szczegółowy Wykaz Wykrytych Usterek i Zalecenia");
      doc.moveDown(0.5);

      if (report.issues.length === 0) {
        doc.fontSize(10).fillColor("#16a34a").text("Gratulacje! Nie wykryto żadnych nieprawidłowości w badanym zakresie.");
      } else {
        report.issues.slice(0, 30).forEach((issue, index) => {
          // Check if need new page
          if (doc.y > 720) {
            doc.addPage();
          }

          const badgeColor =
            issue.severity === "CRITICAL"
              ? "#dc2626"
              : issue.severity === "WARNING"
              ? "#d97706"
              : "#2563eb";

          doc.fontSize(9).fillColor(badgeColor).text(`[${issue.severity}] `, { continued: true });
          doc.fillColor("#0f172a").fontSize(10).text(issue.title, { continued: true });
          if (issue.affectedIdentifier) {
            doc.fillColor("#64748b").fontSize(9).text(` (${issue.affectedIdentifier})`);
          } else {
            doc.text("");
          }

          doc.fontSize(9).fillColor("#334155").text(`Opis: ${issue.description}`);
          doc.fontSize(9).fillColor("#1e40af").text(`Zalecana naprawa: ${issue.suggestedFix}`);
          doc.moveDown(0.5);
        });

        if (report.issues.length > 30) {
          doc.fontSize(8).fillColor("#64748b").text(`...oraz ${report.issues.length - 30} innych usterek dostępnych w panelu online.`);
        }
      }

      // Footer
      doc.fontSize(8).fillColor("#94a3b8").text(
        "BaseDoctor - Diagnostyka Base.com w trybie Read-Only. Raport wygenerowano automatycznie.",
        40,
        790,
        { align: "center", width: 515 }
      );

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
