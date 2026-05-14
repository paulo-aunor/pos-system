//all database functions related to app settings will go here
import { db } from "./db";

export const DEFAULTS = {
  storeName: "My Restaurant",
  currencySymbol: "₱",
  taxRate: 0,
  paymentMethods: [
    { id: "cash", label: "Cash" },
    { id: "gcash", label: "Gcash" },
    { id: "card", label: "Card" },
    { id: "staff", label: "Staff Payment" },
    { id: "owner", label: "Owner Payment" },
  ],
  diningTypes: ["dine-in", "takeout", "delivery"],
};

export const getSetting = async (key) => {
  const existingKey = await db.settings.get(key);
  if (existingKey) {
    return existingKey.value;
  }
  return DEFAULTS[key];
};

export const getAllSettings = async () => {
  const saved = await db.settings.toArray();
  const result = { ...DEFAULTS };
  saved.forEach((record) => {
    result[record.key] = record.value;
  });
  return result;
};

export const setSetting = async (key, value) => {
  await db.settings.put({ key, value });
};

export const setSettings = async (obj) => {
  await Promise.all(
    Object.entries(obj).map(([key, value]) => setSetting(key, value)),
  );
};
