/**
 * Storage Module
 * Handles all interactions with localStorage
 */

const STORAGE_KEY = 'fresko_inventory';

// Get all items
export function getItems() {
    const items = localStorage.getItem(STORAGE_KEY);
    return items ? JSON.parse(items) : [];
}

// Save all items
export function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Add a single item
export function addItem(item) {
    const items = getItems();
    items.push(item);
    saveItems(items);
}

// Remove items by ID
export function removeItems(ids) {
    let items = getItems();
    items = items.filter(item => !ids.includes(item.id));
    saveItems(items);
}

// Update an item
export function updateItem(updatedItem) {
    let items = getItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
        items[index] = updatedItem;
        saveItems(items);
    }
}
