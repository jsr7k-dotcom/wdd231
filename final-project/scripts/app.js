/**
 * Fresko - Main Application Entry Point
 * Handles page routing logic and initializes modules.
 */

import { initInventory } from './modules/ui.js';
import { initAddItem } from './modules/ui.js';
import { initRecipes } from './modules/ui.js';

// Simple router based on pathname
const path = window.location.pathname;
const page = path.split("/").pop();

document.addEventListener('DOMContentLoaded', () => {
    console.log("Fresko App Initialized");

    try {
        if (page === 'index.html' || page === '') {
            initInventory();
        } else if (page === 'add-item.html') {
            initAddItem();
        } else if (page === 'recipes.html') {
            initRecipes();
        }
    } catch (error) {
        console.error("Initialization Error:", error);
    }
});
