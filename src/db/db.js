import Dexie from "dexie";

// create the DB and define the schema for the tables
// POSDatabase is the name of the database, and it will be stored 
// in the browser's IndexedDB
export const db = new Dexie("POSDatabase");

db.version(1).stores({
    //& means that the field is the primary key, 
    // and it will be indexed for faster queries
    menuItems: "&sku, name, category, price",

    //id is UUID for Inventory Schema
    inventory: "id, &inventoryNumber,category, quantity",

    //Transactions table will store the sales transactions
    transactions: "id, timestamp, synced, total",

    //SyncQueue will store the operations that need to be 
    //synced with the server
    syncQueue: "id, type, createdAt"
})

db.version(2).stores({
    //& means that the field is the primary key, 
    // and it will be indexed for faster queries
    menuItems: "&sku, name, category, price",

    //id is UUID for Inventory Schema
    inventory: "id, &inventoryNumber,category, quantity",

    //Transactions table will store the sales transactions
    transactions: "id, timestamp, synced, total",

    //SyncQueue will store the operations that need to be 
    //synced with the server
    syncQueue: "id, type, createdAt"
})