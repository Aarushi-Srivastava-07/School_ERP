import * as XLSX from "xlsx";

/**
 * @param {Object} opts
 * @param {string} opts.sheetName        Worksheet name (Excel caps at 31 chars)
 * @param {string[]} opts.columns        Column headers, in display order
 * @param {(string|number)[][]} opts.rows Rows — must already reflect the
 *                                       current filters/search/sort exactly as
 *                                       shown on screen (NOT raw context data)
 * @param {string} [opts.fileName]       Base file name (without extension/date)
 */
export function exportReportToExcel({ sheetName, columns, rows, fileName }) {
  const worksheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);

  // Auto column widths — based on the longest value (or header) in each column
  worksheet["!cols"] = columns.map((col, colIndex) => {
    const longest = rows.reduce(
      (max, row) => Math.max(max, String(row[colIndex] ?? "").length),
      String(col).length
    );
    return { wch: Math.min(Math.max(longest + 3, 10), 42) };
  });

  const workbook = XLSX.utils.book_new();
  const safeSheetName = (sheetName || "Report").replace(/[\\/*?:[\]]/g, "").slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const safeFileName = (fileName || sheetName || "Report").replace(/[^\w-]+/g, "_");
  const dateForFile = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${safeFileName}_${dateForFile}.xlsx`);
}