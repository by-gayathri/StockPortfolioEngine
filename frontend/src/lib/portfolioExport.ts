import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Stock {
  symbol: string;
  name: string;
  allocation: number;
  price: number;
  shares: number;
  value: number;
  change: number;
  strategy?: string;
}

interface PortfolioData {
  amount: number;
  strategies: string[];
  stocks: Stock[];
  totalValue: number;
  totalChange: number;
  weeklyTrend: { day: string; value: number }[];
}

export function generatePortfolioPDF(data: PortfolioData): void {
  const { amount, strategies, stocks, totalValue, totalChange, weeklyTrend } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text("Portfolio Report", pageWidth / 2, 20, { align: "center" });
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth / 2, 28, { align: "center" });

  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Portfolio Summary", 14, 42);
  
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(14, 45, pageWidth - 14, 45);

  // Summary boxes
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  
  const summaryY = 55;
  doc.text("Initial Investment:", 14, summaryY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(`$${amount.toLocaleString()}`, 60, summaryY);
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Current Value:", 100, summaryY);
  doc.setTextColor(30, 30, 30);
  doc.setFont(undefined, "bold");
  doc.text(`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 140, summaryY);
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Weekly Change:", 14, summaryY + 10);
  const changeColor = totalChange >= 0 ? [34, 197, 94] : [239, 68, 68]; // Green or Red
  doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
  doc.setFont(undefined, "bold");
  doc.text(`${totalChange >= 0 ? "+" : ""}${totalChange.toFixed(2)}%`, 60, summaryY + 10);
  
  doc.setFont(undefined, "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Strategies:", 100, summaryY + 10);
  doc.setTextColor(30, 30, 30);
  doc.text(strategies.join(", "), 140, summaryY + 10);

  // Selected Strategies Section
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Selected Investment Strategies", 14, 85);
  doc.setDrawColor(59, 130, 246);
  doc.line(14, 88, pageWidth - 14, 88);

  let yPos = 95;
  strategies.forEach((strategy, index) => {
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.text(`${index + 1}. ${strategy}`, 18, yPos);
    yPos += 7;
  });

  // Holdings Table
  yPos += 5;
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Portfolio Holdings", 14, yPos);
  doc.line(14, yPos + 3, pageWidth - 14, yPos + 3);

  // Prepare table data
  const tableData = stocks.map((stock) => [
    stock.symbol,
    stock.name.length > 25 ? stock.name.substring(0, 25) + "..." : stock.name,
    stock.strategy || "-",
    `$${stock.price.toFixed(2)}`,
    stock.shares.toFixed(4),
    `${stock.allocation.toFixed(1)}%`,
    `$${stock.value.toFixed(2)}`,
    `${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%`,
  ]);

  autoTable(doc, {
    startY: yPos + 8,
    head: [["Symbol", "Name", "Strategy", "Price", "Shares", "Allocation", "Value", "Change"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 18 },
      1: { cellWidth: 35 },
      2: { cellWidth: 28 },
      3: { halign: "right", cellWidth: 20 },
      4: { halign: "right", cellWidth: 18 },
      5: { halign: "right", cellWidth: 22 },
      6: { halign: "right", cellWidth: 22 },
      7: { halign: "right", cellWidth: 18 },
    },
    margin: { left: 14, right: 14 },
  });

  // Weekly Performance Section (if there's room or on new page)
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  
  if (finalY > 230) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos = finalY + 15;
  }

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Weekly Performance Trend", 14, yPos);
  doc.line(14, yPos + 3, pageWidth - 14, yPos + 3);

  // Weekly trend table
  const trendData = weeklyTrend.map((item) => [
    item.day,
    `$${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: yPos + 8,
    head: [["Date", "Portfolio Value"]],
    body: trendData,
    theme: "striped",
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: "right", cellWidth: 60 },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 130,
  });

  // Footer
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Smart Portfolio Builder | Generated ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Download the PDF
  const fileName = `Portfolio_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

export function generateEmailContent(data: PortfolioData): { subject: string; body: string } {
  const { amount, strategies, stocks, totalValue, totalChange } = data;
  
  const subject = `My Investment Portfolio Report - ${new Date().toLocaleDateString()}`;
  
  const stocksList = stocks
    .map(
      (stock) =>
        `  • ${stock.symbol} (${stock.name}): $${stock.value.toFixed(2)} (${stock.allocation.toFixed(1)}%)`
    )
    .join("\n");

  const body = `
📊 INVESTMENT PORTFOLIO REPORT
Generated: ${new Date().toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 PORTFOLIO SUMMARY
• Initial Investment: $${amount.toLocaleString()}
• Current Value: $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Weekly Change: ${totalChange >= 0 ? "+" : ""}${totalChange.toFixed(2)}%

🎯 SELECTED STRATEGIES
${strategies.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}

📈 HOLDINGS
${stocksList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This report was generated by Smart Portfolio Builder.
For the full interactive experience, visit our platform.

  `.trim();

  return { subject, body };
}

export function shareViaEmail(data: PortfolioData): void {
  const { subject, body } = generateEmailContent(data);
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink, "_blank");
}

export function copyToClipboard(data: PortfolioData): Promise<boolean> {
  const { body } = generateEmailContent(data);
  return navigator.clipboard
    .writeText(body)
    .then(() => true)
    .catch(() => false);
}
