import ImportMenu from "./components/ImportMenu";
import ImportInventory from "./components/ImportInventory";
import InventoryManager from "./components/InventoryManager";
import POSScreen from "./components/POSScreen";
import SalesReport from "./components/SalesReport";

export default function App() {
  return (
    <div>
      <h1>POS System</h1>
      <POSScreen />
      <hr />
      <SalesReport />
      <hr />
      <InventoryManager />
      <hr />
      <ImportMenu />
      <hr />
      <ImportInventory />
    </div>
  );
}
