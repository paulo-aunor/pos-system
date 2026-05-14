import ImportMenu from "./components/ImportMenu";
import ImportInventory from "./components/ImportInventory";
import InventoryManager from "./components/InventoryManager";
import POSScreen from "./components/POSScreen";
import SalesReport from "./components/SalesReport";
import { useState, useEffect } from "react";
import Settings from "./components/Settings";
//import getSetting function from settingsDb.js
import { getSetting } from "./db/settingsDb";

export default function App() {
  //state for navigation
  const [activeView, setActiveView] = useState("pos");
  //state for current restaurant name
  const [storeName, setStoreName] = useState("Resto Name");

  //view object to render based on active view
  const views = {
    pos: <POSScreen />,
    report: <SalesReport />,
    inventory: <InventoryManager />,
    importMenu: <ImportMenu />,
    importInventory: <ImportInventory />,
    settings: <Settings storeName={storeName} setStoreName={setStoreName} />,
  };

  //effects
  //gets the store name from the Settings
  //used .then instead of async/await for cleaner code (cannot mark callback as async in this case)
  useEffect(() => {
    getSetting("storeName").then((name) => setStoreName(name));
  }, []);

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <h2>{storeName}</h2>
        <button
          className={activeView === "pos" ? "active" : ""}
          onClick={() => setActiveView("pos")}
        >
          POS
        </button>
        <button
          className={activeView === "report" ? "active" : ""}
          onClick={() => setActiveView("report")}
        >
          Sales Report
        </button>
        <button
          className={activeView === "inventory" ? "active" : ""}
          onClick={() => setActiveView("inventory")}
        >
          Inventory
        </button>
        <button
          className={activeView === "importMenu" ? "active" : ""}
          onClick={() => setActiveView("importMenu")}
        >
          Import Menu
        </button>
        <button
          className={activeView === "importInventory" ? "active" : ""}
          onClick={() => setActiveView("importInventory")}
        >
          Import Inventory
        </button>
        <button
          className={activeView === "settings" ? "active" : ""}
          onClick={() => setActiveView("settings")}
        >
          Settings
        </button>
      </aside>
      <main className="main-content">{views[activeView]}</main>
    </div>
  );
}
