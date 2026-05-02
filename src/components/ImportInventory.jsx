// src/components/ImportInventory.jsx
// UI component for importing raw material quantities from an Excel file
// The Excel file must have a sheet tab named exactly "Inventory"
// Columns required: inventory_number, description, category, quantity
// Only updates existing records — unknown inventory_numbers are rejected
import { useState, useRef } from "react";
import { importInventoryFile } from "../utils/inventoryParser";

export default function ImportInventory() {
  // same state pattern as ImportMenu
  // each component manages its own independent state
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  const fileInputRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () =>
        reject(new Error("Failed to read file. Please try again."));
      reader.readAsArrayBuffer(file);
    });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      setError(
        "Invalid file type. Please select an Excel file (.xlsx or .xls).",
      );
      return;
    }

    setFileName(file.name);
    setImporting(true);

    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      // pass raw bytes to the inventory parser — different parser than ImportMenu
      const importResults = await importInventoryFile(arrayBuffer);
      setResults(importResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const handleButtonClick = () => {
    setResults(null);
    setError(null);
    setFileName(null);
    fileInputRef.current.click();
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="import-inventory">
      <h2>Import Inventory</h2>
      <p>
        Upload your Inventory Excel file. The sheet tab must be named{" "}
        <strong>"Inventory"</strong>.
      </p>
      <p>
        Required columns: <code>inventory_number</code>,{" "}
        <code>description</code>, <code>category</code>, <code>quantity</code>
      </p>
      <p>
        ⚠️ Only existing inventory items will be updated. Unknown inventory
        numbers will be rejected.
      </p>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <button onClick={handleButtonClick} disabled={importing}>
        {importing ? "Importing..." : "Import Inventory File"}
      </button>

      {fileName && (
        <p>
          File: <strong>{fileName}</strong>
        </p>
      )}

      {error && (
        <div className="import-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {results && (
        <div className="import-results">
          <h3>Inventory Sheet</h3>

          {/* updated count — rows where quantity was successfully updated */}
          <p>✅ {results.updated} items updated</p>

          {results.skipped > 0 && <p>⚠️ {results.skipped} rows skipped</p>}

          {/* rejected table — inventory_numbers not found in the database */}
          {/* shown as a table so staff can see exactly which rows to add manually */}
          {results.rejected.length > 0 && (
            <div className="rejected-list">
              <h4>⛔ Rejected — Add these manually first</h4>
              <table>
                <thead>
                  <tr>
                    <th>Excel Row</th>
                    <th>Inventory No.</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {/* each rejected item becomes one table row */}
                  {/* item.excelRow tells staff the exact Excel row to look up */}
                  {results.rejected.map((item, index) => (
                    <tr key={index}>
                      <td>{item.excelRow}</td>
                      <td>{item.inventoryNumber}</td>
                      <td>{item.description}</td>
                      <td>{item.category}</td>
                      <td>{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* data quality errors — missing fields or invalid values */}
          {results.errors.length > 0 && (
            <div className="error-list">
              <h4>Errors</h4>
              {results.errors.map((err, index) => (
                <p key={index}>
                  • Row {err.excelRow}: {err.reason}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
