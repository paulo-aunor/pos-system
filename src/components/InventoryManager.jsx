// Manages raw materials inventory — importing from Excel, showing current inventory, and adjusting quantities
// Add, view, edit, delete inventory items in the Inventory tab
import { useState, useEffect } from "react";
import {
  addInventoryItem,
  getAllInventoryItems as getAllInventory,
  updateInventoryQuantity,
  deleteInventoryItem,
} from "../db/inventoryDb";

export default function InventoryManager() {
  //state maagement
  //items are the full list of inventory items from db.
  //starts as empty array, then populated with getAllInventory on component mount
  const [items, setItems] = useState([]);

  //form inputs
  //one object to hold all form inputs for adding/editing inventory items
  const [form, setForm] = useState({
    inventoryNumber: "",
    name: "",
    category: "",
    quantity: "",
  });

  //editingId is the id of the item currently being edited.
  //null means we're adding a new item, not editing an existing one.
  //when set to an id, the form will populate with that item's data for editing.
  const [editingId, setEditingId] = useState(null);

  //editingQuantity is the new quantity value when editing an existing item.
  //starts as empty string, then set to the current quantity of the item being edited when edit mode is activated.
  const [editingQuantity, setEditingQuantity] = useState("");

  //formError holds any validation error messages for the form inputs.
  //starts as empty string, then set to an error message if validation fails (e.g. missing fields, non-numeric quantity).
  const [formError, setFormError] = useState("");

  //formSuccess holds success messages for form actions (e.g. item added, item updated).
  //starts as empty string, then set to a success message when an action is successfully completed.
  const [formSuccess, setFormSuccess] = useState("");

  //effects functions
  //useEffect to load inventory items from the database when the component mounts.
  useEffect(() => {
    loadInventory();
  }, []);

  //data loaders
  //loadInventory fetches all inventory items from the database and sets the items state.
  const loadInventory = async () => {
    const allItems = await getAllInventory();
    setItems(allItems);
  };

  //form handlers
  //handleInputChange updates the form state when an input field changes.
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  //handleAddItem validates the form inputs and adds a new inventory item to the database.
  const handleAddItem = async () => {
    //clear previous messages
    setFormError(null);
    setFormSuccess(null);

    //validate inputs
    if (
      !form.inventoryNumber ||
      !form.name ||
      !form.category ||
      form.quantity === ""
    ) {
      setFormError("All fields are required.");
      return;
    }

    //validate quantity is a number
    if (isNaN(Number(form.quantity))) {
      setFormError("Quantity must be a number.");
      return;
    }

    try {
      //addInventoryItem is from inventoryDb.js
      // it throws an error if the inventory number already exists
      await addInventoryItem({
        inventoryNumber: form.inventoryNumber.trim(),
        name: form.name.trim(),
        category: form.category.trim(),
        quantity: Number(form.quantity),
      });

      //reset the form back to empty values after successful addition
      setForm({
        inventoryNumber: "",
        name: "",
        category: "",
        quantity: "",
      });

      //show success message
      setFormSuccess(`Item "${form.name}" added successfully!`);

      //reload inventory list to show the new item
      await loadInventory();
    } catch (error) {
      //show error message if something goes wrong (e.g. duplicate inventory number)
      setFormError(error.message);
    }
  };

  //edit handlers
  //handleEditStart sets the editingId and populates the form with the item's current data for editing.
  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditingQuantity(item.quantity.toString());
  };

  //handleEditSave validates the new quantity and updates the inventory item in the database.
  const handleEditSave = async (id) => {
    //validates the new quantity input is a number
    if (isNaN(Number(editingQuantity))) {
      setFormError("Quantity must be a number.");
      return;
    }

    //updateInventoryQuantity is from inventoryDb.js
    await updateInventoryQuantity(id, Number(editingQuantity));

    //exit edit mode
    setEditingId(null);
    setEditingQuantity("");

    //reload list to show the updated quantity
    await loadInventory();
  };

  //handleEditCancel exits edit mode without saving changes. Happens when cancel button is clicked
  const handleEditCancel = () => {
    setEditingId(null);
    setEditingQuantity("");
  };

  //delete handlers
  //handleDelete deletes an inventory item from the database and reloads the inventory list.
  const handleDelete = async (id, name) => {
    //window confirm to ask user to confirm deletion of the item
    //returns true if user clicks "OK", false if user clicks "Cancel" to prevent accidental deletions
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`,
    );
    if (!confirmed) return;

    await deleteInventoryItem(id);
    //reload list to reflect the deletion
    await loadInventory();
  };

  //group by category for display
  //groupedItems returns an object where each key is a category and the value is an array of items in that category.
  //reduce() iterates over the items array and builds this grouped structure for easier display in the UI.
  //acc = accumulator. starts as an empty object {}. For each item, it checks if acc already has a key for the item's category. If not, it creates an empty array for that category. Then it pushes the item into the appropriate category array. Finally, it returns the accumulated object with items grouped by category.
  //item is current array element being processed. It represents an inventory item with properties like id, inventoryNumber, name, category, quantity.
  const groupedItems = items.reduce((acc, item) => {
    //if the category doesn't exist in the accumulator, create an empty array for it
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    //push the current item into the appropriate category array
    acc[item.category].push(item);
    return acc;
  }, {});

  //sortedCategories is an array of category names sorted alphabetically for display purposes.
  const sortedCategories = Object.keys(groupedItems).sort();

  //rendering
  return (
    <div className="inventory-manager">
      <h2>Inventory Manager</h2>

      {/* ── Add form ── */}
      <div className="inventory-form">
        <h3>Add Raw Material</h3>

        {/* name={field} connects each input to handleFormChange */}
        {/* value={form.field} makes it a controlled input */}
        {/* a controlled input's value is always driven by React state */}
        {/* not by whatever the user typed directly into the DOM */}
        <input
          name="inventoryNumber"
          value={form.inventoryNumber}
          onChange={handleFormChange}
          placeholder="Inventory Number (e.g. INV-001)"
        />
        <input
          name="name"
          value={form.name}
          onChange={handleFormChange}
          placeholder="Description"
        />
        <input
          name="category"
          value={form.category}
          onChange={handleFormChange}
          placeholder="Category"
        />
        <input
          name="quantity"
          value={form.quantity}
          onChange={handleFormChange}
          placeholder="Quantity"
          type="number"
        />

        <button onClick={handleAddItem}>Add Item</button>

        {/* show error or success message below the form */}
        {formError && <p className="form-error">⚠️ {formError}</p>}
        {formSuccess && <p className="form-success">✅ {formSuccess}</p>}
      </div>

      {/* ── Inventory list ── */}
      <div className="inventory-list">
        <h3>Current Inventory</h3>

        {/* show a message if no items exist yet */}
        {items.length === 0 && (
          <p>No inventory items yet. Add one above or import from Excel.</p>
        )}

        {/* render one section per category */}
        {sortedCategories.map((category) => (
          <div key={category} className="inventory-category">
            <h4>{category}</h4>
            <table>
              <thead>
                <tr>
                  <th>Inv. No.</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* render one row per item in this category */}
                {groupedItems[category].map((item) => (
                  <tr key={item.id}>
                    <td>{item.inventoryNumber}</td>
                    <td>{item.name}</td>

                    {/* quantity cell — shows input when editing, plain text otherwise */}
                    {/* editingId === item.id is true only for the row being edited */}
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          value={editingQuantity}
                          onChange={(e) => setEditingQuantity(e.target.value)}
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>

                    {/* actions cell — shows Save/Cancel when editing, Edit/Delete otherwise */}
                    <td>
                      {editingId === item.id ? (
                        <>
                          {/* <> </> is a React Fragment — groups elements without adding a DOM element */}
                          <button onClick={() => handleEditSave(item.id)}>
                            Save
                          </button>
                          <button onClick={handleEditCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditStart(item)}>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
