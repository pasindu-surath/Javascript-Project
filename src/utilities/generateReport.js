import { transactions } from "../script.js";

export function generateReport() {
  let doc;
  try {
    const { jsPDF } = window.jspdf;
    // Create a new PDF document
    doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  } catch (error) {
    console.error(
      "Error initializing jsPDF: you may need to use https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js script"
    );
  }

  // Set colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [44, 62, 80]; // Dark slate
  const accentColor = [46, 204, 113]; // Green
  const negativeColor = [231, 76, 60]; // Red

  // Document metadata
  doc.setProperties({
    title: "Budget Report",
    subject: "Financial Summary",
    author: "Budget Tracker App",
    creator: "Budget Tracker App",
  });

  // Calculate page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Background header area
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Title
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("BUDGET REPORT", margin, 25);

  // Current date
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${dateStr}`, pageWidth - margin - 60, 25);

  // Reset text color for main content
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  // Summary calculations
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome + totalExpense;

  // Summary section heading
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Summary", margin, 55);

  // Summary grid
  const summaryStartY = 65;
  const boxWidth = (pageWidth - 2 * margin) / 3;
  const boxHeight = 40;

  // Income box
  doc.setFillColor(220, 220, 220);
  doc.roundedRect(margin, summaryStartY, boxWidth - 5, boxHeight, 3, 3, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("TOTAL INCOME", margin + 10, summaryStartY + 15);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`$${totalIncome.toFixed(2)}`, margin + 10, summaryStartY + 30);

  // Expense box
  doc.setFillColor(220, 220, 220);
  doc.roundedRect(
    margin + boxWidth,
    summaryStartY,
    boxWidth - 5,
    boxHeight,
    3,
    3,
    "F"
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("TOTAL EXPENSES", margin + boxWidth + 10, summaryStartY + 15);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(negativeColor[0], negativeColor[1], negativeColor[2]);
  doc.text(
    `$${Math.abs(totalExpense).toFixed(2)}`,
    margin + boxWidth + 10,
    summaryStartY + 30
  );

  // Balance box
  const balanceColor = balance >= 0 ? accentColor : negativeColor;
  doc.setFillColor(220, 220, 220);
  doc.roundedRect(
    margin + boxWidth * 2,
    summaryStartY,
    boxWidth - 5,
    boxHeight,
    3,
    3,
    "F"
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("NET BALANCE", margin + boxWidth * 2 + 10, summaryStartY + 15);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
  doc.text(
    `$${balance.toFixed(2)}`,
    margin + boxWidth * 2 + 10,
    summaryStartY + 30
  );

  // Category breakdown section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(
    "Expense Breakdown by Category",
    margin,
    summaryStartY + boxHeight + 20
  );

  // Add a divider line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(
    margin,
    summaryStartY + boxHeight + 25,
    pageWidth - margin,
    summaryStartY + boxHeight + 25
  );

  // Calculate category totals
  const categorySummary = {};
  let totalCategorized = 0;

  transactions.forEach((t) => {
    if (t.amount < 0) {
      if (!categorySummary[t.category]) {
        categorySummary[t.category] = 0;
      }
      categorySummary[t.category] += Math.abs(t.amount);
      totalCategorized += Math.abs(t.amount);
    }
  });

  // Sort categories by amount (descending)
  const sortedCategories = Object.keys(categorySummary).sort(
    (a, b) => categorySummary[b] - categorySummary[a]
  );

  // Draw category breakdown
  let yPos = summaryStartY + boxHeight + 35;
  doc.setFontSize(11);

  sortedCategories.forEach((category, index) => {
    if (categorySummary[category] > 0) {
      const amount = categorySummary[category];
      const percentage = Math.round((amount / totalCategorized) * 100);

      // Category name and amount
      doc.setFont("helvetica", "bold");
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`${category}`, margin, yPos);

      doc.setFont("helvetica", "normal");
      doc.text(
        `$${amount.toFixed(2)} (${percentage}%)`,
        pageWidth - margin - 30,
        yPos,
        { align: "right" }
      );

      // Progress bar background
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(margin, yPos + 5, pageWidth - 2 * margin, 5, 2, 2, "F");

      // Progress bar fill
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const fillWidth = (pageWidth - 2 * margin) * (percentage / 100);
      doc.roundedRect(margin, yPos + 5, fillWidth, 5, 2, 2, "F");

      yPos += 20;

      // Add page if needed
      if (yPos > pageHeight - 30 && index < sortedCategories.length - 1) {
        doc.addPage();
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 15, "F");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text("Budget Report - Continued", margin, 10);
        yPos = 30;
      }
    }
  });

  // Recent transactions section (if there's space)
  if (yPos < pageHeight - 70) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Recent Transactions", margin, yPos + 10);

    // Add a divider line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 15, pageWidth - margin, yPos + 15);

    // Table headers
    yPos += 25;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Date", margin, yPos);
    doc.text("Description", margin + 30, yPos);
    doc.text("Category", margin + 100, yPos);
    doc.text("Amount", pageWidth - margin - 15, yPos, { align: "right" });

    // Table rows
    doc.setFont("helvetica", "normal");
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    recentTransactions.forEach((transaction) => {
      yPos += 10;

      // Format date
      const txDate = new Date(transaction.date);
      const formattedDate = txDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      doc.text(formattedDate, margin, yPos);

      // Description (truncate if needed)
      let desc = transaction.description;
      if (desc.length > 25) {
        desc = desc.substring(0, 22) + "...";
      }
      doc.text(desc, margin + 30, yPos);

      doc.text(transaction.category, margin + 100, yPos);

      // Amount with color
      const isExpense = transaction.amount < 0;
      doc.setTextColor(
        isExpense ? negativeColor[0] : accentColor[0],
        isExpense ? negativeColor[1] : accentColor[1],
        isExpense ? negativeColor[2] : accentColor[2]
      );
      const prefix = isExpense ? "-" : "+";
      doc.text(
        `${prefix}$${Math.abs(transaction.amount).toFixed(2)}`,
        pageWidth - margin - 15,
        yPos,
        { align: "right" }
      );

      // Reset text color
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    });
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by Budget Tracker App", pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  // Save the PDF
  doc.save("Budget_Report.pdf");
}

const generateReportBtn = document.getElementById("generate-report-btn");
generateReportBtn.addEventListener("click", generateReport);
