// Nutrition Care Logic - Independent Feature
// Strictly budget ৳0, no external APIs/CDNs, emojis only

const NUTRITION_CARE_DATA = {
    lose: {
        title: "Food You Should Eat to Lose Weight",
        headerTitle: "Eat to Lose Weight",
        goalEmoji: "🥗",
        notice: "<strong>🥗 Weight Loss Guidelines:</strong> Focus on foods with high satiety, dietary fiber, and lean protein to stay satisfied in a moderate caloric deficit. Weight loss depends on total energy balance — no individual food causes weight loss on its own. Select a food category below:",
        categories: [
            {
                id: "staple",
                name: "Staple Foods",
                icon: "🍚",
                desc: "High-fiber whole grains & portioned staples",
                foodIds: ["f2", "f3", "f4", "f5"]
            },
            {
                id: "lentils",
                name: "Lentils & Dal",
                icon: "🫘",
                desc: "Plant protein and soluble dietary fiber",
                foodIds: ["f6", "f7", "f8", "f9"]
            },
            {
                id: "fish",
                name: "Fish",
                icon: "🐟",
                desc: "Lean freshwater fish in light curries",
                foodIds: ["f38", "f39", "f82", "f83", "f85", "f42"]
            },
            {
                id: "meat_egg",
                name: "Meat & Eggs",
                icon: "🍗",
                desc: "High-satiety lean protein sources",
                foodIds: ["f45", "f69", "f43", "f63"]
            },
            {
                id: "veg",
                name: "Vegetables",
                icon: "🥦",
                desc: "Low calorie density, high volume & nutrients",
                foodIds: ["f12", "f14", "f16", "f17", "f18", "f20", "f21", "f22", "f23", "f24", "f26", "f28", "f29", "f30"]
            },
            {
                id: "fruits",
                name: "Fruits",
                icon: "🍎",
                desc: "Fresh, fiber-rich fruits & natural hydration",
                foodIds: ["f31", "f32", "f34", "f36", "f49", "f50"]
            },
            {
                id: "dairy",
                name: "Dairy",
                icon: "🥛",
                desc: "Low-fat and probiotic plain yogurt",
                foodIds: ["f46", "f70"]
            }
        ]
    },
    gain: {
        title: "Food You Should Eat to Gain Weight",
        headerTitle: "Eat to Gain Weight",
        goalEmoji: "🍛",
        notice: "<strong>🍛 Weight Gain Guidelines:</strong> Focus on nutrient-dense, calorie-rich wholesome foods, healthy fats, and quality protein to support a healthy caloric surplus. Weight gain depends on total energy balance — no individual food causes weight gain on its own. Select a food category below:",
        categories: [
            {
                id: "staple",
                name: "Staple Foods",
                icon: "🍚",
                desc: "Calorie-dense complex carbs & rice dishes",
                foodIds: ["f1", "f4", "f51", "f52", "f53", "f54", "f80", "f81"]
            },
            {
                id: "lentils",
                name: "Lentils & Dal",
                icon: "🫘",
                desc: "Dense legume protein and carbohydrates",
                foodIds: ["f8", "f9", "f6"]
            },
            {
                id: "fish",
                name: "Fish",
                icon: "🐟",
                desc: "Nutritious and omega-rich fish options",
                foodIds: ["f37", "f40", "f41", "f89"]
            },
            {
                id: "meat_egg",
                name: "Meat & Eggs",
                icon: "🍗",
                desc: "Protein-packed and calorie-dense meats & eggs",
                foodIds: ["f44", "f58", "f59", "f62", "f64", "f65", "f66", "f67", "f68"]
            },
            {
                id: "veg",
                name: "Vegetables & Carbs",
                icon: "🥔",
                desc: "Energy-giving starchy potatoes & rich curries",
                foodIds: ["f10", "f73", "f11", "f86", "f87"]
            },
            {
                id: "fruits",
                name: "Fruits",
                icon: "🍌",
                desc: "Naturally sweet and energy-dense fruits",
                foodIds: ["f33", "f35"]
            },
            {
                id: "dairy",
                name: "Dairy & Drinks",
                icon: "🥛",
                desc: "Whole milk, sweet yogurt, and rich milkshakes",
                foodIds: ["f47", "f71", "f72", "f146", "f148", "f150"]
            },
            {
                id: "nuts",
                name: "Nuts & Seeds",
                icon: "🥜",
                desc: "Concentrated healthy fats, calories & protein",
                foodIds: ["f48"]
            }
        ]
    }
};

let currentCareGoalKey = "lose";
let currentCareCategoryKey = null;

/**
 * Open category selection screen for a given goal ('lose' or 'gain')
 */
function openNutritionCareGoal(goalKey) {
    if (!NUTRITION_CARE_DATA[goalKey]) return;
    currentCareGoalKey = goalKey;
    const goalData = NUTRITION_CARE_DATA[goalKey];

    // Update screen header & notice
    const headerTitle = document.getElementById("care-category-header-title");
    if (headerTitle) headerTitle.textContent = goalData.headerTitle;

    const noticeEl = document.getElementById("care-goal-notice");
    if (noticeEl) noticeEl.innerHTML = `<p style="color: var(--text-main); font-size: 0.9rem; margin: 0;">${goalData.notice}</p>`;

    // Render Category Grid
    const grid = document.getElementById("care-category-grid");
    if (grid) {
        grid.innerHTML = "";
        goalData.categories.forEach(cat => {
            const card = document.createElement("div");
            card.className = "category-card";
            card.onclick = () => selectCareCategory(cat.id);
            card.innerHTML = `
                <div class="category-emoji">${cat.icon}</div>
                <div class="category-name">${cat.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; line-height: 1.2;">${cat.desc}</div>
            `;
            grid.appendChild(card);
        });
    }

    navigate("nutrition-care-categories");
}

/**
 * Select a category and show its food items
 */
function selectCareCategory(categoryId) {
    currentCareCategoryKey = categoryId;
    const goalData = NUTRITION_CARE_DATA[currentCareGoalKey];
    if (!goalData) return;

    const category = goalData.categories.find(c => c.id === categoryId);
    if (!category) return;

    // Reset search bar
    const searchInput = document.getElementById("care-items-search-input");
    if (searchInput) searchInput.value = "";

    // Set header title
    const headerTitle = document.getElementById("care-items-header-title");
    if (headerTitle) headerTitle.textContent = `${category.name} (${currentCareGoalKey === 'lose' ? 'Lose Weight' : 'Gain Weight'})`;

    renderCareFoodCards();
    navigate("nutrition-care-items");
}

/**
 * Helper to compute serving calories accurately when gram weight is available
 */
function formatCareServingAndCalories(food) {
    const calPer100 = food.caloriesPer100g;
    const serving = food.servingSize || "100g";

    // Strictly match exact gram format like "150g", "100g", "30g", "50g", "200g", "250g"
    const exactGramMatch = serving.match(/^(\d+)\s*g$/i);
    let servingCalBadge = "";

    if (exactGramMatch) {
        const grams = parseInt(exactGramMatch[1], 10);
        if (!isNaN(grams) && grams > 0) {
            const approxServingCalories = Math.round((calPer100 * grams) / 100);
            servingCalBadge = `<span class="calorie-text" style="color: #166534; font-weight: 600;">~${approxServingCalories} kcal / serving (${serving})</span>`;
        }
    }

    return `
        <div class="food-nutrition" style="margin-top: 6px; display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span class="nutrition-badge">Per 100g</span>
                <span class="calorie-text">${calPer100} kcal</span>
                ${servingCalBadge}
            </div>
            <div style="font-size: 0.85rem; color: #555;">
                <strong>Suggested Serving:</strong> ${serving}
            </div>
        </div>
    `;
}

/**
 * Render food cards for the currently selected category & goal
 */
function renderCareFoodCards() {
    const list = document.getElementById("care-items-food-list");
    if (!list) return;

    list.innerHTML = "";

    const goalData = NUTRITION_CARE_DATA[currentCareGoalKey];
    if (!goalData) return;

    const category = goalData.categories.find(c => c.id === currentCareCategoryKey);
    if (!category) return;

    // Get filter query if any
    const searchInput = document.getElementById("care-items-search-input");
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    // Resolve food objects from foodDatabase
    let foods = category.foodIds
        .map(id => (typeof foodDatabase !== "undefined" ? foodDatabase.find(f => f.id === id) : null))
        .filter(Boolean);

    // Apply client-side search query
    if (query) {
        foods = foods.filter(food => food.name.toLowerCase().includes(query) || (food.description && food.description.toLowerCase().includes(query)));
    }

    if (foods.length === 0) {
        list.innerHTML = `<div class="coming-soon-notice" style="text-align: center; margin-top: 16px;">No foods found matching your search in this category.</div>`;
        return;
    }

    // Sort alphabetically by name
    const sortedFoods = [...foods].sort((a, b) => a.name.localeCompare(b.name));

    sortedFoods.forEach(food => {
        const card = document.createElement("div");
        card.className = "food-card";

        const emoji = typeof getCategoryEmoji === "function" ? getCategoryEmoji(food.category) : "🍽️";

        card.innerHTML = `
            <div class="food-image-area"><span class="food-emoji">${emoji}</span></div>
            <div class="food-info-area">
                <h3 class="food-name">${food.name}</h3>
                <p class="food-method">${food.description || ""}</p>
                ${formatCareServingAndCalories(food)}
            </div>
        `;
        list.appendChild(card);
    });
}

/**
 * Live search filter inside the current category
 */
function searchCareItems() {
    renderCareFoodCards();
}
