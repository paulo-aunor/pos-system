// src/components/ImportMenu.jsx
// UI component for importing menu items from an Excel file
// The Excel file must have a sheet tab named exactly "Menu"
// Columns required: serial_number, description, amount, category
import { useState, useRef } from "react";
import { importMenuFile } from "../utils/menuParser";

export default function ImportMenu() {
  // importing — true while the import is running, used to show loading state
  // results — the summary object returned by the parser after a successful import
  // error — any file-level error message e.g. wrong file type or missing sheet
  // fileName — the name of the picked file shown to the user
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  // ref to the hidden file input so we can trigger it from our styled button
  const fileInputRef = useRef(null);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  // wraps the old callback-based FileReader API in a Promise
  // so we can use async/await instead of nested callbacks
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () =>
        reject(new Error("Failed to read file. Please try again."));
      reader.readAsArrayBuffer(file);
    });
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  // called when the user picks a file from the file picker dialog
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    // user opened picker but cancelled — nothing to do
    if (!file) return;

    // validate file type — must be Excel
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
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
      // read file into memory as raw bytes
      const arrayBuffer = await readFileAsArrayBuffer(file);
      // pass raw bytes to the menu parser
      const importResults = await importMenuFile(arrayBuffer);
      // store results so JSX can render the summary
      setResults(importResults);
    } catch (err) {
      // catches wrong sheet name, corrupted file, or any parser error
      setError(err.message);
    } finally {
      // always stop loading and reset the input regardless of success or failure
      setImporting(false);
      event.target.value = "";
    }
  };

  // called when the Import button is clicked
  // resets previous state and opens the file picker
  const handleButtonClick = () => {
    setResults(null);
    setError(null);
    setFileName(null);
    // programmatically click the hidden file input to open the picker
    fileInputRef.current.click();
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="import-menu">
      <h2>Import Menu Items</h2>
      <p>
        Upload your Menu Excel file. The sheet tab must be named{" "}
        <strong>"Menu"</strong>.
      </p>
      <p>
        Required columns: <code>serial_number</code>, <code>description</code>,{" "}
        <code>amount</code>, <code>category</code>
      </p>

      {/* hidden file input — triggered by the button below */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* visible button — disabled while importing to prevent double clicks */}
      <button onClick={handleButtonClick} disabled={importing}>
        {importing ? "Importing..." : "Import Menu File"}
      </button>

      {/* show picked file name */}
      {fileName && (
        <p>
          File: <strong>{fileName}</strong>
        </p>
      )}

      {/* file-level errors — wrong type, missing sheet tab */}
      {error && (
        <div className="import-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* results summary — only shows after a completed import */}
      {results && (
        <div className="import-results">
          <h3>Menu Sheet</h3>

          {/* imported count — how many rows were saved or updated */}
          <p>✅ {results.imported} menu items imported or updated</p>

          {/* skipped count — only shown if there were skipped rows */}
          {results.skipped > 0 && <p>⚠️ {results.skipped} rows skipped</p>}

          {/* row-level errors — missing fields or invalid values */}
          {results.errors.length > 0 && (
            <div className="error-list">
              <h4>Errors</h4>
              {/* .map() turns the errors array into a list of paragraphs */}
              {results.errors.map((err, index) => (
                <p key={index}>
                  • {err.reason} — {JSON.stringify(err.data)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
