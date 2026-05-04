import ImportMenu from "./components/ImportMenu";
import ImportInventory from "./components/ImportInventory";
import InventoryManager from "./components/InventoryManager";
import POSScreen from "./components/POSScreen";

export default function App() {
  return (
    <div>
      <h1>POS System</h1>
      <POSScreen />
      <hr />
      <InventoryManager />
      <hr />
      <ImportMenu />
      <hr />
      <ImportInventory />
    </div>
  );
}
