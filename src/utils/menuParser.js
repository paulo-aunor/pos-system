// src/utils/menuParser.js
// Handles importing menu items from a dedicated Menu Excel file
// Expected columns: serial_number, description, amount, category
import * as XLSX from "xlsx";
import { db } from "../db/db";

// ── Helper ────────────────────────────────────────────────────────────────────

// Cleans any value coming from Excel
// handles nulls, trims spaces, lowercases for consistency
const normalize = (str) => str?.toString().toLowerCase().trim() ?? "";

// ── Sheet Reader ──────────────────────────────────────────────────────────────

// Reads the raw Excel file bytes and returns the rows from the Menu sheet
// arrayBuffer is the raw bytes of the file from the browser's FileReader
const parseMenuFile = (arrayBuffer) => {
  // XLSX.read converts raw bytes into a workbook object SheetJS can work with
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  // Access the sheet by its tab name — must match exactly
  const menuSheet = workbook.Sheets["Menu"];

  // Fail early with a clear message if the sheet tab is named wrong
  if (!menuSheet)
    throw new Error(
      'Could not find a sheet named "Menu". Check the tab name in your Excel file.',
    );

  // sheet_to_json converts each row into a plain JavaScript object
  // column headers become the keys e.g. { serial_number: 'LATTE-001', description: 'Latte' }
  return XLSX.utils.sheet_to_json(menuSheet);
};

// ── Main Export ───────────────────────────────────────────────────────────────

// The only function the UI calls — takes raw file bytes and imports menu items
// returns a results summary the UI uses to show feedback to the user
export const importMenuFile = async (arrayBuffer) => {
  const rows = parseMenuFile(arrayBuffer);

  // results tracks what happened so the UI can show a meaningful summary
  const results = { imported: 0, skipped: 0, errors: [] };

  for (const row of rows) {
    // validate all required fields exist before trying to save
    // !value is true when a value is missing, empty, null, or undefined
    if (
      !row.serial_number ||
      !row.description ||
      row.amount === undefined ||
      !row.category
    ) {
      results.errors.push({
        reason: "Missing required fields",
        data: row,
      });
      results.skipped++;
      continue; // skip to the next row — don't try to save this one
    }

    // Number() converts the value to a number
    // isNaN() returns true if the conversion failed e.g. Number('abc') = NaN
    const price = Number(row.amount);
    if (isNaN(price)) {
      results.errors.push({
        reason: `Amount is not a valid number: "${row.amount}"`,
        data: row,
      });
      results.skipped++;
      continue;
    }

    // put() = insert if sku doesn't exist, update if it does
    // this makes importing the same file twice completely safe — no duplicates
    await db.menuItems.put({
      sku: row.serial_number.toString().trim(),
      name: row.description.toString().trim(),
      price,
      category: row.category.toString().trim(),
    });

    results.imported++;
  }

  return results;
};
