import ImportMenu from "./components/ImportMenu";
import ImportInventory from "./components/ImportInventory";
import InventoryManager from "./components/InventoryManager";
import POSScreen from "./components/POSScreen";
import SalesReport from "./components/SalesReport";
import { useState } from "react";

export default function App() {
  //state for navigation
  const [activeView, setActiveView] = useState("pos");

  //view object to render based on active view
  const views = {
    pos: <POSScreen />,
    report: <SalesReport />,
    inventory: <InventoryManager />,
    importMenu: <ImportMenu />,
    importInventory: <ImportInventory />,
  };
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <h2>RestoName</h2>
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
      </aside>
      <main className="main-content">{views[activeView]}</main>
    </div>
  );
}
