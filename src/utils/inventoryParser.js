// src/utils/inventoryParser.js
// Handles importing raw materials from a dedicated Inventory Excel file
// Expected columns: inventory_number, description, category, quantity
// Rules:
//   - existing inventory_number → update quantity only
//   - unknown inventory_number → reject and tell the user
//   - removed rows → stay in the system untouched
import * as XLSX from "xlsx";
import { db } from "../db/db";

// ── Helper ────────────────────────────────────────────────────────────────────

const normalize = (str) => str?.toString().toLowerCase().trim() ?? "";

// ── Sheet Reader ──────────────────────────────────────────────────────────────

const parseInventoryFile = (arrayBuffer) => {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const inventorySheet = workbook.Sheets["Inventory"];

  if (!inventorySheet)
    throw new Error(
      'Could not find a sheet named "Inventory". Check the tab name in your Excel file.',
    );

  return XLSX.utils.sheet_to_json(inventorySheet);
};

// ── Main Export ───────────────────────────────────────────────────────────────

export const importInventoryFile = async (arrayBuffer) => {
  const rows = parseInventoryFile(arrayBuffer);

  const results = {
    updated: 0,
    skipped: 0,
    errors: [], // data quality problems — missing fields, bad values
    rejected: [], // business rule rejections — inventory_number not in system
  };

  // we use index-based loop instead of for...of because we need i
  // to calculate the exact Excel row number for staff to look up
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Excel row number — row 1 is the header, data starts at row 2
    // i is zero-based so we add 2 to get the real Excel row number
    const excelRowNumber = i + 2;

    // validate required fields
    // row.quantity === undefined catches missing quantity without rejecting 0
    // because !0 is true which would incorrectly flag zero as missing
    if (
      !row.inventory_number ||
      !row.description ||
      !row.category ||
      row.quantity === undefined
    ) {
      results.errors.push({
        excelRow: excelRowNumber,
        reason: "Missing required fields",
        data: row,
      });
      results.skipped++;
      continue;
    }

    const quantity = Number(row.quantity);
    if (isNaN(quantity)) {
      results.errors.push({
        excelRow: excelRowNumber,
        reason: `Quantity is not a valid number: "${row.quantity}"`,
        data: row,
      });
      results.skipped++;
      continue;
    }

    const inventoryNumber = row.inventory_number.toString().trim();

    // check if this inventory_number already exists in the database
    // this is the core business rule — unknown numbers are rejected
    const existing = await db.inventory
      .where("inventoryNumber")
      .equals(inventoryNumber)
      .first();

    if (!existing) {
      // inventory_number not found — reject with full details so staff know what to add manually
      results.rejected.push({
        excelRow: excelRowNumber,
        inventoryNumber,
        description: row.description.toString().trim(),
        category: row.category.toString().trim(),
        reason: `"${inventoryNumber}" does not exist in the system. Add it manually first.`,
      });
      results.skipped++;
      continue;
    }

    // record exists — update quantity only, leave everything else untouched
    await db.inventory.update(existing.id, { quantity });
    results.updated++;
  }

  return results;
};
