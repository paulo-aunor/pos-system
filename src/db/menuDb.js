//All db operations related to menu items
import { db } from "./db";

//get all menu items
//ordered by category and then by name
//used to populate the menu item list in the UI
export const getAllMenuItems = async () => {
  return await db.menuItems.orderBy("name").toArray();
};

//get all unique categories from menu items
//returns sorted array of unique category name
//used to render the category filter dropdown in the UI
export const getCategories = async () => {
  const items = await db.menuItems.toArray();

  //automatically remove duplicates and sort the categories
  //returns an array of unique category names sorted alphabetically
  const uniqueCategories = [
    ...new Set(items.map((item) => item.category)),
  ].sort();
  return uniqueCategories.sort();
};
