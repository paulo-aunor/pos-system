import * as XLSX from 'xlsx';
import { db } from '../db/db';
import { generateId } from './utils/generateId';

//helper functions
//normalizes string for matching - removes spaces and converts to lowercase
const normalize = (str) => str?.toString().toLowerCase().trim() ?? '';

//function to parse the Excel file and return the sales and inventory data
const parseExcelFile = async (arrayBuffer) => {
    const workbook = XLSX.read(arrayBuffer, {type: 'array'})

    const salesSheet = workbook.Sheets['Sales'];
    const inventorySheet = workbook.Sheet['Inventory'];

    if (!salesSheet) throw new Error('Could not find sheet named "Sales" Check the tab name in your Excel file and make sure it matches exactly, including capitalization.');
    if (!inventorySheet) throw new Error('Could not find sheet named "Inventory" Check the tab name in your Excel file and make sure it matches exactly, including capitalization.');

    const salesRows = XLSX.utils.sheet_to_json(salesSheet);
    const inventoryRows = XLSX.utils.sheet_to_json(inventorySheet);
    
    return {salesRows, inventoryRows};
}

//function to import sales data from Excel file
const importSales = async (salesRows) => {
    const results = {imported: 0, skipped: 0, errors:[]};

    for (const row of salesRows){
        if (!row.serial_number || !row.description || !row.amount || !row.category){
            results.errors.push(`Skipped row with missing required fields: ${JSON.stringify(row)}`);
            results.skipped++;
            continue;
        }

        const price = Number(row.amount);
        if (isNaN(price)){
            results.errors.push(`Skipped "${row.description}" - amount is not a number: ${row.amount}`);
            results.skipped++;
            continue;
        }

        await db.menuItems.put({
            sku: row.serial_number.toString().trim(),
            name: row.description.toString().trim(),
            price: price,
            category: row.category.toString().trim(),
        })
        results.imported++;
    }

    return results;
}

//function to import inventory data from Excel file
const importInventory = async (inventoryRows) => {
    const results = {
        updated: 0,
        skipped: 0,
        errors: [],
        rejected: [],
    }

    for (let i = 0; i < inventoryRows.length; i++){
        const row = inventoryRows[i];
        const excelRowNumber = i + 2; // +2 to account for header row and 0-based index

        if (!row.inventory_number || !row.description || !row.category || row.quantity === undefined){
            results.errors.push({
                excelRow: excelRowNumber,
                reason: 'Missing required fields (inventory_number, description, category, quantity)',
                data:row,
            })
            results.skipped++;
            continue;
        }

        const quantity = Number(row.quantity);
        if (isNaN(quantity)){
            results.errors.push({
                excelRow: excelRowNumber,
                reason: `Quantity is not a number: ${row.quantity}`,
                data: row,
            })
            results.skipped++;
            continue;
        }

        const inventoryNumber = row.inventory_number.toString().trim();

        const existing = await db.inventoryNumber
        .where('inventoryNumber')
        .equals(inventoryNumber)
        .first();

        if (!existing){
            results.rejected.push({
                excelRow: excelRowNumber,
                inventoryNumber: inventoryNumber,
                description: row.description.toString().trim(),
                category: row.category.toString().trim(),
                reason: `Inventory number "${inventoryNumber}" does not exist in the system. Please add it to the inventory before importing.`,
            })
            results.skipped++;
            continue;
        }

        await db.inventory.update(exisiting.id, {quantity: quantity});
        results.updated++;
        }

    return results;
}

//main function to handle the entire. process of parsing the Excel file and importing the data
export const importExcelFile = async (arrayBuffer) => {
    const {salesRows, inventoryRows} = parseExcelFile(arrayBuffer);

    const salesResults = await importSales(salesRows);
    const inventoryResults = await importInventory(inventoryRows);

    return{
        sales: salesResults,
        inventory: inventoryResults,
    }
}

