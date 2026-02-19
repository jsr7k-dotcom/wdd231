/**
 * UI Module
 * Handles DOM manipulation and page-specific logic
 */

import * as Storage from './storage.js';
import * as Utils from './utils.js';
import * as API from './api.js';

/* =========================================
   INVENTORY PAGE
   ========================================= */

export function initInventory() {
    const listContainer = document.getElementById('inventory-list');
    const emptyState = document.getElementById('empty-state');
    const sortSelect = document.getElementById('sort-select');
    const multiActionBtn = document.getElementById('multi-action-btn');
    const actionModal = document.getElementById('action-modal');
    const btnConsumed = document.getElementById('btn-consumed');
    const btnWaste = document.getElementById('btn-waste');
    const btnCancelAction = document.getElementById('btn-cancel-action');

    let items = Storage.getItems();
    let selectedIds = new Set();

    if (!listContainer) return;

    // Render function
    const render = () => {
        listContainer.innerHTML = '';

        if (items.length === 0) {
            emptyState.style.display = 'block';
            listContainer.style.display = 'none';
            if (sortSelect) sortSelect.style.display = 'none';
            return;
        } else {
            emptyState.style.display = 'none';
            listContainer.style.display = 'grid';
            if (sortSelect) sortSelect.style.display = 'block';
        }

        // Sort items
        const sortValue = sortSelect ? sortSelect.value : 'asc';
        items.sort((a, b) => {
            const dateA = new Date(a.expiry);
            const dateB = new Date(b.expiry);
            return sortValue === 'asc' ? dateA - dateB : dateB - dateA;
        });

        items.forEach(item => {
            const daysLeft = Utils.getDaysRemaining(item.expiry);
            const freshness = Utils.getFreshnessStatus(daysLeft);
            const quantity = item.quantity || 1;

            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = item.id;

            if (selectedIds.has(item.id)) {
                card.classList.add('selected');
            }

            const isSelected = selectedIds.has(item.id) ? 'checked' : '';

            card.innerHTML = `
                <div class="item-card-content">
                    <input type="checkbox" class="item-select-checkbox item-checkbox" ${isSelected}>
                    <img src="${item.image || 'assets/logo-placeholder.png'}" alt="${item.name}" class="item-thumb">
                    <div class="item-details">
                        <h3 class="item-title">${item.name} <span class="item-quantity">(x${quantity})</span></h3>
                        <span class="category-badge">${item.category}</span>
                    </div>
                    <div class="item-meta">
                        <span class="days-left text-${freshness.status}">${daysLeft} days</span>
                        <div class="expiry-date">Expires: ${new Date(item.expiry).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="freshness-bar-container">
                    <div class="freshness-bar status-${freshness.status}" style="width: ${freshness.percent}%;"></div>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.type === 'checkbox') return;

                if (selectedIds.has(item.id)) {
                    selectedIds.delete(item.id);
                } else {
                    selectedIds.add(item.id);
                }
                updateSelectionUI();
                render();
            });

            const checkbox = card.querySelector('.item-select-checkbox');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedIds.add(item.id);
                } else {
                    selectedIds.delete(item.id);
                }
                updateSelectionUI();
                render();
            });

            listContainer.appendChild(card);
        });
    };

    const updateSelectionUI = () => {
        if (selectedIds.size > 0) {
            multiActionBtn.style.display = 'block';
            multiActionBtn.textContent = `Update Selection (${selectedIds.size})`;
        } else {
            multiActionBtn.style.display = 'none';
        }
    };

    const processAction = (action) => {
        // Handle partial quantity logic if single item selected
        if (selectedIds.size === 1) {
            const id = Array.from(selectedIds)[0];
            const item = items.find(i => i.id === id);
            const qtyInput = document.getElementById('action-quantity');
            const qtyToRemove = parseInt(qtyInput.value) || 1;

            if (item && item.quantity > qtyToRemove) {
                // Update quantity -> Keep item
                item.quantity -= qtyToRemove;
                Storage.updateItem(item);
            } else {
                // Remove item completely
                Storage.removeItems([id]);
            }
        } else {
            // Multiple items -> Remove all selected
            Storage.removeItems(Array.from(selectedIds));
        }

        selectedIds.clear();
        items = Storage.getItems();
        updateSelectionUI();
        actionModal.style.display = 'none';
        render();
    };

    if (sortSelect) sortSelect.addEventListener('change', render);

    if (multiActionBtn) {
        multiActionBtn.addEventListener('click', () => {
            const qtyGroup = document.getElementById('modal-quantity-group');
            const qtyInput = document.getElementById('action-quantity');
            const maxQtySpan = document.getElementById('max-qty');

            if (selectedIds.size === 1) {
                const id = Array.from(selectedIds)[0];
                const item = items.find(i => i.id === id);
                if (item) {
                    qtyGroup.style.display = 'block';
                    qtyInput.value = 1;
                    qtyInput.max = item.quantity || 1;
                    maxQtySpan.textContent = item.quantity || 1;
                }
            } else {
                qtyGroup.style.display = 'none';
            }
            actionModal.style.display = 'flex';
        });
    }

    // Modal Listeners
    if (btnConsumed) btnConsumed.addEventListener('click', () => processAction('consumed'));
    if (btnWaste) btnWaste.addEventListener('click', () => processAction('waste'));
    if (btnCancelAction) btnCancelAction.addEventListener('click', () => actionModal.style.display = 'none');

    render();
}

/* =========================================
   ADD ITEM PAGE
   ========================================= */

export function initAddItem() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const resultsDropdown = document.getElementById('results-dropdown');
    const addForm = document.getElementById('add-form');
    const itemForm = document.getElementById('item-form');
    const cancelBtn = document.getElementById('cancel-btn');

    if (!searchInput) return;

    const handleSearch = Utils.debounce(async (query) => {
        if (!query) {
            resultsDropdown.innerHTML = '';
            resultsDropdown.style.display = 'none';
            return;
        }

        const products = await API.searchProduct(query);
        renderResults(products);
    }, 300);

    const renderResults = (products) => {
        resultsDropdown.innerHTML = '';
        if (products.length === 0) {
            const noResult = document.createElement('div');
            noResult.className = 'result-item';
            noResult.textContent = 'No products found. Click to add manually.';
            noResult.onclick = () => showForm({ name: searchInput.value });
            resultsDropdown.appendChild(noResult);
        } else {
            products.forEach(p => {
                const item = document.createElement('div');
                item.className = 'result-item';
                item.innerHTML = `
                    <img src="${p.image || 'assets/logo-placeholder.png'}" class="result-thumb">
                    <div>
                        <strong>${p.name}</strong><br>
                        <small>${p.brand}</small>
                    </div>
                `;
                item.onclick = () => showForm(p);
                resultsDropdown.appendChild(item);
            });
        }
        resultsDropdown.style.display = 'block';
    };

    const showForm = (product) => {
        resultsDropdown.style.display = 'none';
        addForm.style.display = 'block';

        document.getElementById('item-name').value = product.name || '';
        document.getElementById('item-image-url').value = product.image || '';

        const catSelect = document.getElementById('item-category');
        if (product.category) {
            for (let i = 0; i < catSelect.options.length; i++) {
                if (product.category.toLowerCase().includes(catSelect.options[i].value.toLowerCase())) {
                    catSelect.selectedIndex = i;
                    break;
                }
            }
        }
    };

    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value;
        if (query) handleSearch(query);
    });

    cancelBtn.addEventListener('click', () => {
        // addForm.style.display = 'none'; // Keep visible
        itemForm.reset();
        searchInput.value = '';
        resultsDropdown.style.display = 'none';
    });

    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const getCategoryFallback = (category) => {
            const map = {
                'Pantry': '🥫',
                'Dairy': '🥛',
                'Produce': '🥦',
                'Bakery': '🍞',
                'Meat': '🥩',
                'Frozen': '❄️',
                'Beverages': '🥤',
                'Snacks': '🍿'
            };
            // Create a dummy placeholder image with emoji if needed, or just use emoji text.
            // Requirement said "use placeholders for a .png company logo... Any new items without images must show an emoji"
            // Since we use <img> tag, we need a data URI or a placeholder service.
            // Let's use a simple SVG placeholder with the emoji.

            const emoji = map[category] || '📦';
            return `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
        };

        const newItem = {
            id: Utils.generateId(),
            name: document.getElementById('item-name').value,
            category: document.getElementById('item-category').value,
            quantity: parseInt(document.getElementById('item-quantity').value) || 1,
            expiry: document.getElementById('item-expiry').value,
            image: document.getElementById('item-image-url').value || getCategoryFallback(document.getElementById('item-category').value),
            status: 'active'
        };

        Storage.addItem(newItem);
        window.location.href = 'index.html';
    });
}

/* =========================================
   RECIPES PAGE
   ========================================= */

export function initRecipes() {
    const findBtn = document.getElementById('find-recipes-btn');
    const grid = document.getElementById('recipe-grid');
    const modal = document.getElementById('recipe-modal');
    const closeModal = modal ? modal.querySelector('.close-modal') : null;

    if (!findBtn) return;

    const getIngredients = () => {
        const items = Storage.getItems();
        const ingredients = items
            .filter(i => {
                const days = Utils.getDaysRemaining(i.expiry);
                return days <= 5;
            })
            .map(i => i.name)
            .join(',');
        return ingredients;
    };

    findBtn.addEventListener('click', async () => {
        const ingredients = getIngredients();

        if (!ingredients) {
            alert("No expiring items found to cook with! (Items with <= 5 days left)");
            return;
        }

        grid.innerHTML = '<p>Searching for recipes...</p>';

        const recipes = await API.findRecipesByIngredients(ingredients);

        grid.innerHTML = '';
        if (recipes.length === 0) {
            grid.innerHTML = '<p>No recipes found. Try adding more items.</p>';
            return;
        }

        recipes.forEach(r => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <img src="${r.image}" class="recipe-thumb" alt="${r.title}">
                <div class="recipe-content">
                    <h3 class="recipe-title">${r.title}</h3>
                    <div class="recipe-meta">
                        <span class="tag tag-missing">${r.missedIngredientCount} Missing Ingredients</span>
                        <span class="tag tag-time">${r.likes} Likes</span> 
                    </div>
                </div>
            `;

            card.addEventListener('click', () => openModal(r));
            grid.appendChild(card);
        });
    });

    const openModal = (recipe) => {
        document.getElementById('modal-title').textContent = recipe.title;
        document.getElementById('modal-image').src = recipe.image;
        const link = `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-')}-${recipe.id}`;
        document.getElementById('modal-link').href = link;
        document.getElementById('modal-ingredients').innerHTML = `
            <p><strong>Missed Ingredients:</strong> ${recipe.missedIngredientCount}</p>
            <p><strong>Used Ingredients:</strong> ${recipe.usedIngredientCount}</p>
         `;

        modal.style.display = 'flex';
    };

    if (closeModal) closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}
