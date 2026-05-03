import { db } from "./db";
import { generateId } from "../utils/generateId";

//function to add a new inventory item to the database
//takes an object with inventoryNumber, name, category, and quantity
export const addInventoryItem = async ({
  inventoryNumber,
  name,
  category,
  quantity,
}) => {
  //if inventoryNumber exists, throw an error
  const existingItem = await db.inventory
    .where("inventoryNumber")
    .equals(inventoryNumber.trim())
    .first();

  if (existingItem) {
    throw new Error(
      `Inventory item with number ${inventoryNumber} already exists.`,
    );
  }

  await db.inventory.add({
    id: generateId(),
    inventoryNumber: inventoryNumber.trim(),
    name: name.trim(),
    category: category.trim(),
    quantity: Number(quantity),
  });
};

//function to get all inventory items from the database
export const getAllInventoryItems = async () => {
  return await db.inventory.orderBy("category").toArray();
};

//function to get all inventory items from the database by category
export const getInventoryItemsByCategory = async (category) => {
  return await db.inventory.where("category").equals(category.trim()).toArray();
};

//function to update inventory quantity
export const updateInventoryQuantity = async (id, quantity) => {
  await db.inventory.update(id, { quantity: Number(quantity) });
};

//function to delete an inventory item
export const deleteInventoryItem = async (id) => {
  await db.inventory.delete(id);
};
