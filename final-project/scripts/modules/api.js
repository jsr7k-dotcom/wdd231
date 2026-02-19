/**
 * API Module
 * Handles interactions with the Spoonacular API
 */

// Spoonacular API Key
const SPOONACULAR_API_KEY = '1dccfda90d7644ae80bc5934d3b91879';

// Helper to map Spoonacular aisle to Fresko category
function mapAisleToCategory(aisle) {
    if (!aisle) return 'Pantry';
    const lowerAisle = aisle.toLowerCase();

    if (lowerAisle.includes('produce')) return 'Produce';
    if (lowerAisle.includes('milk') || lowerAisle.includes('dairy') || lowerAisle.includes('cheese') || lowerAisle.includes('yogurt')) return 'Dairy';
    if (lowerAisle.includes('bread') || lowerAisle.includes('bakery')) return 'Bakery';
    if (lowerAisle.includes('meat') || lowerAisle.includes('seafood') || lowerAisle.includes('poultry')) return 'Meat';
    if (lowerAisle.includes('frozen') || lowerAisle.includes('ice cream')) return 'Frozen';
    if (lowerAisle.includes('tea') || lowerAisle.includes('coffee') || lowerAisle.includes('soda') || lowerAisle.includes('beverage')) return 'Beverages';
    if (lowerAisle.includes('chips') || lowerAisle.includes('snack') || lowerAisle.includes('candy') || lowerAisle.includes('chocolate')) return 'Snacks';

    return 'Pantry'; // Default
}

// Search Generic Ingredients (e.g. "apple", "chicken")
async function searchGenericIngredients(query) {
    try {
        const url = `https://api.spoonacular.com/food/ingredients/autocomplete?query=${encodeURIComponent(query)}&number=5&metaInformation=true&apiKey=${SPOONACULAR_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Spoonacular API Error');
        const data = await response.json();

        return data.map(item => ({
            name: item.name,
            brand: '', // Generic items usually don't have a brand
            image: `https://spoonacular.com/cdn/ingredients_100x100/${item.image}`,
            category: mapAisleToCategory(item.aisle),
            id: `sp-ing-${item.id}`,
            source: 'spoonacular-ingredient'
        }));
    } catch (error) {
        console.error("Ingredient Search Error:", error);
        return [];
    }
}

// Search Packaged Products (e.g. "Oreo", "Heinz")
async function searchPackagedProducts(query) {
    try {
        const url = `https://api.spoonacular.com/food/products/search?query=${encodeURIComponent(query)}&number=5&apiKey=${SPOONACULAR_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Spoonacular Product Error');
        const data = await response.json();

        return data.products.map(product => ({
            name: product.title,
            brand: '', // Spoonacular product search mainly gives title
            image: product.image,
            category: 'Pantry', // Default, as aisle isn't always in basic search
            id: `sp-prod-${product.id}`,
            source: 'spoonacular-product'
        }));
    } catch (error) {
        console.error("Product Search Error:", error);
        return [];
    }
}

// Unified Search Function
export async function searchProduct(query) {
    if (!query || query.length < 3) return [];

    try {
        // Run searches in parallel
        const [ingredients, products] = await Promise.all([
            searchGenericIngredients(query),
            searchPackagedProducts(query)
        ]);

        // Combine and dedup
        const combined = [...ingredients, ...products];
        return combined.slice(0, 10); // Return top 10 results
    } catch (error) {
        console.error("Unified Search Error:", error);
        return [];
    }
}

// Spoonacular Recipe Search


export async function findRecipesByIngredients(ingredients) {
    if (!ingredients) return [];

    // Check if key is still placeholder
    if (SPOONACULAR_API_KEY === 'YOUR_API_KEY') {
        console.warn("Spoonacular API Key is missing. Returning mock data.");
        // Fallback to mock if no key
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        title: "Mock Pantry Pasta (No API Key)",
                        image: "https://spoonacular.com/recipeImages/716429-556x370.jpg", // Larger mock image
                        missedIngredientCount: 2,
                        usedIngredientCount: 3,
                        likes: 50
                    }
                ]);
            }, 500);
        });
    }

    try {
        // Find recipes
        const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=6&ranking=1&apiKey=${SPOONACULAR_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 402) throw new Error('API Quota Exceeded');
            throw new Error('API Error');
        }

        const data = await response.json();

        // Enhance data with higher res image URLs if possible
        // Spoonacular 'findByIngredients' returns 'image' field which is often small.
        // We can manually replace the dimensions in the URL if it's the standard hosted image.
        // E.g. https://spoonacular.com/recipeImages/recipe-id-312x231.jpg -> 636x393

        return data.map(r => {
            // Try to upgrade image quality
            let largeImage = r.image;
            if (largeImage && largeImage.includes('-312x231')) {
                largeImage = largeImage.replace('-312x231', '-556x370');
            }
            return {
                ...r,
                image: largeImage
            };
        });
    } catch (error) {
        console.error("Recipe Search Error:", error);
        return [];
    }
}
