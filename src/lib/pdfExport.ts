import { jsPDF } from "jspdf";
import type { HealthAnalysis, UserProfile } from "@/types/health";

export function generateHealthReportPDF(analysis: HealthAnalysis, user?: UserProfile | null) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const emeraldPrimary = [21, 128, 61]; // #15803D
  const emeraldDark = [16, 92, 45];
  const slateDark = [15, 23, 42]; // #0F172A
  const slateMuted = [100, 116, 139]; // #64748B
  const slateLight = [241, 245, 249]; // #F1F5F9
  const amberColor = [217, 119, 6]; // #D97706
  const roseColor = [225, 29, 72]; // #E11D48

  let y = margin;

  // 1. TOP HEADER BANNER
  doc.setFillColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
  doc.rect(margin, y, contentWidth, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("ACTIVELIFE WELLNESS LABS", margin + 6, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 252, 231);
  doc.text("CLINICAL BODY COMPOSITION & MULTI-BIOMARKER REPORT", margin + 6, y + 15);

  const reportDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFont("helvetica", "bold");
  doc.text(`REPORT ID: ALW-${Date.now().toString().slice(-6)}`, pageWidth - margin - 6, y + 9, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(`DATE: ${reportDate}`, pageWidth - margin - 6, y + 15, { align: "right" });

  y += 26;

  // 2. PATIENT / CUSTOMER DEMOGRAPHICS CARD
  doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);

  const customerName = user?.fullName || "Valued Customer";
  const customerAge = analysis.raw?.age || user?.age || 30;
  const customerGender = (analysis.raw?.gender || user?.gender || "female").toUpperCase();
  const customerWeight = analysis.raw?.weight ? `${analysis.raw.weight} kg` : "N/A";

  doc.text(`Patient: ${customerName}`, margin + 6, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(`Age: ${customerAge} yrs   |   Gender: ${customerGender}   |   Recorded Weight: ${customerWeight}`, margin + 6, y + 13);

  // Status Badge on the right
  const isGood = analysis.overallStatus === "good";
  const isBorderline = analysis.overallStatus === "borderline";
  const statusColor = isGood ? emeraldPrimary : isBorderline ? amberColor : roseColor;
  const statusText = isGood ? "HEALTHY" : isBorderline ? "BORDERLINE" : "AT RISK";

  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - margin - 36, y + 4.5, 30, 9, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, pageWidth - margin - 21, y + 10.5, { align: "center" });

  y += 23;

  // 3. EXECUTIVE CLINICAL SUMMARY
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text("Clinical Health Summary", margin, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const splitSummary = doc.splitTextToSize(analysis.summary, contentWidth);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 4.2 + 3;

  // 4. MULTI-BIOMARKER METRICS TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text("Comprehensive Anthropometric Breakdown", margin, y);
  y += 5;

  // Table Header
  const colX = [margin, margin + 40, margin + 70, margin + 110, margin + 140];
  const colW = [40, 30, 40, 30, contentWidth - 140];

  doc.setFillColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.rect(margin, y, contentWidth, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("BIOMARKER", colX[0] + 3, y + 5);
  doc.text("MEASURED VALUE", colX[1] + 3, y + 5);
  doc.text("HEALTHY REFERENCE", colX[2] + 3, y + 5);
  doc.text("STATUS", colX[3] + 3, y + 5);
  doc.text("CLINICAL NOTE", colX[4] + 3, y + 5);

  y += 7;

  // Table Rows
  const metrics = analysis.metrics || [];
  metrics.forEach((m, idx) => {
    const rowBg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(margin, y, contentWidth, 8, "F");
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(m.name, colX[0] + 3, y + 5.5);

    doc.setFont("helvetica", "bold");
    doc.text(`${m.value} ${m.unit}`, colX[1] + 3, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(m.healthyRange, colX[2] + 3, y + 5.5);

    // Status pill
    const mColor = m.status === "good" ? emeraldPrimary : m.status === "borderline" ? amberColor : roseColor;
    const mLabel = m.status === "good" ? "NORMAL" : m.status === "borderline" ? "BORDERLINE" : "ALERT";
    doc.setFont("helvetica", "bold");
    doc.setTextColor(mColor[0], mColor[1], mColor[2]);
    doc.text(mLabel, colX[3] + 3, y + 5.5);

    // Explanation
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    const noteText = doc.splitTextToSize(m.explanation, colW[4] - 4);
    doc.text(noteText[0] || "", colX[4] + 3, y + 5.5);

    y += 8;
  });

  y += 6;

  // 5. POSITIVES & AREAS TO IMPROVE (2 COLUMNS)
  const halfW = (contentWidth - 6) / 2;

  // Left Column: Positives
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.roundedRect(margin, y, halfW, 28, 2, 2, "F");
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, y, halfW, 28, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.text("POSITIVE HEALTH INDICATORS", margin + 4, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  let posY = y + 10;
  (analysis.positives || []).slice(0, 3).forEach((item) => {
    const lines = doc.splitTextToSize(`• ${item}`, halfW - 8);
    doc.text(lines[0] || "", margin + 4, posY);
    posY += 4.5;
  });

  // Right Column: Areas to Improve
  doc.setFillColor(254, 242, 242); // rose-50
  doc.roundedRect(margin + halfW + 6, y, halfW, 28, 2, 2, "F");
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(margin + halfW + 6, y, halfW, 28, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(roseColor[0], roseColor[1], roseColor[2]);
  doc.text("AREAS FOR INTERVENTION", margin + halfW + 10, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(159, 18, 57);
  let negY = y + 10;
  (analysis.negatives || []).slice(0, 3).forEach((item) => {
    const lines = doc.splitTextToSize(`! ${item}`, halfW - 8);
    doc.text(lines[0] || "", margin + halfW + 10, negY);
    negY += 4.5;
  });

  y += 33;

  // 6. PERSONALIZED ACTION RECOMMENDATIONS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text("Personalized Clinical Action Protocols", margin, y);
  y += 5;

  (analysis.recommendations || []).slice(0, 4).forEach((rec, idx) => {
    doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
    doc.roundedRect(margin, y, contentWidth, 7.5, 1.5, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(emeraldPrimary[0], emeraldPrimary[1], emeraldPrimary[2]);
    doc.text(`[${idx + 1}]`, margin + 3, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    const recText = doc.splitTextToSize(rec, contentWidth - 16);
    doc.text(recText[0] || "", margin + 11, y + 5);

    y += 8.5;
  });

  y += 3;

  // 7. DAKSHIN AI CONSULTATION CERTIFICATE
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(emeraldDark[0], emeraldDark[1], emeraldDark[2]);
  doc.text("DAKSHIN AI MULTILINGUAL VOICE CONSULTATION", margin + 4, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    "Spoken clinical explanations, lifestyle guidance, and report translations verified in English, Telugu, and Hindi.",
    margin + 4,
    y + 10.5
  );

  // FOOTER DISCLAIMER
  const footerY = pageHeight - margin - 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(
    "Notice: ActiveLife Wellness report generated via AI body composition analysis. Intended for health monitoring and lifestyle education.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  // Trigger Save
  const safeName = (user?.fullName || "Customer").replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `ActiveLife_BMI_Report_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
