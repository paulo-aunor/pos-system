import ImportMenu from "./components/ImportMenu";
import ImportInventory from "./components/ImportInventory";
import InventoryManager from "./components/InventoryManager";

export default function App() {
  return (
    <div>
      <h1>POS System</h1>
      <InventoryManager />
      <hr />
      <ImportMenu />
      <hr />
      <ImportInventory />
    </div>
  );
}
