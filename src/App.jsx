import ImportMenu from "./components/ImportMenu";
import ImportInventory from "./components/ImportInventory";

export default function App() {
  return (
    <div>
      <h1>POS System</h1>
      <ImportMenu />
      <hr />
      <ImportInventory />
    </div>
  );
}
