import ExcelJS from "exceljs";

const RED_FONT = { color: { argb: "FFEF4444" }, bold: true };

export async function exportRowsToXlsx(rows, sheetName, filename, getCellStyle) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  const keys = rows[0] ? Object.keys(rows[0]) : [];
  sheet.columns = keys.map((key) => ({ header: key, key, width: 16 }));

  rows.forEach((row) => {
    const excelRow = sheet.addRow(row);
    if (getCellStyle) {
      keys.forEach((key, i) => {
        if (getCellStyle(row, key)) {
          excelRow.getCell(i + 1).font = RED_FONT;
        }
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
