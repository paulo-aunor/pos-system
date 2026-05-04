//All database operations related to sales transactions
import { db } from "./db";
import { generateId } from "../utils/generateId";

//saveTransaction - called when cashier completes a sale
//saves the full transaction to IndexedDB
//synced: false means it hasn't been sent to the cloud yet
export const saveTransaction = async ({
  items,
  subtotal,
  taxAmount,
  discountAmount,
  total,
  paymentMethod,
  amountTendered,
  change,
}) => {
  const id = generateId();

  await db.transactions.add({
    id,
    items, // snapshot of what was sold [{sku, name, price, quantity, itemTotal}]
    subtotal, // sum before tax and discount
    taxAmount, // tax applied (0 for now)
    discountAmount, // discount applied (0 for now)
    total, // final amount charged
    paymentMethod, // 'cash' | 'gcash' | 'card' | 'staff' | 'owner'
    amountTendered, // what the customer gave (cash only, same as total for others)
    change, // change due (cash only, 0 for others)
    timestamp: new Date(),
    synced: false,
  });

  return id;
};

//getTodayTransactions - returns all transactions from today
//used in the sales report
export const getTodayTransactions = async () => {
  // get start of today — midnight
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const now = new Date();

  return await db.transactions
    .where("timestamp")
    .between(startOfDay, now)
    .toArray();
};

//getTransactionsByRange - returns transactions within a date range
//used in reports for weekly/monthly filtering
export const getTransactionsByRange = async (startDate, endDate) => {
  return await db.transactions
    .where("timestamp")
    .between(startDate, endDate)
    .toArray();
};

//used by the sync engine to find transactions not yet sent to the cloud
export const getUnsyncedTransactions = async () => {
  return await db.transactions
    .where("synced")
    .equals(0) // IndexedDB stores booleans as 0/1
    .toArray();
};

//markTransactionSynced - after a transaction is successfully sent to the cloud, mark it as synced

export const markTransactionSynced = async (id) => {
  await db.transactions.update(id, { synced: true });
};
