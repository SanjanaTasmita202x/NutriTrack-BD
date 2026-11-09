const diabetesFoods = [
    { name: 'Atta Roti', category: 'Staple Foods', serving: '1 medium piece', reason: 'High in fiber, causes a slower rise in blood sugar compared to white flour.', prep: 'Avoid applying ghee or butter.' },
    { name: 'Cooked Brown/Red Rice', category: 'Staple Foods', serving: '100–150g cooked per meal', reason: 'Lower glycemic index than white rice, better for blood sugar management.', prep: 'Requires portion control. Balance with a large serving of vegetables.' },
    { name: 'Plain Cooked White Rice', category: 'Staple Foods', serving: '100-150g cooked per meal', reason: 'A familiar staple that can be included safely when strictly portion-controlled.', prep: 'Do not eat unlimited amounts. Always pair with plenty of non-starchy vegetables and protein.' },
    { name: 'Masoor Dal', category: 'Lentils & Dal', serving: '100–150g cooked', reason: 'Excellent source of plant protein and soluble fiber, which helps stabilize blood sugar.', prep: 'Cook with minimal oil and avoid heavy tarka (tempering) with ghee.' },
    { name: 'Moong Dal', category: 'Lentils & Dal', serving: '100–150g cooked', reason: 'Light, nutritious, and high in fiber.', prep: 'Cook as a soup or thick dal with vegetables.' },
    { name: 'Chola Bhuna (Lightly Spiced)', category: 'Lentils & Dal', serving: '100–150g cooked', reason: 'High in complex carbohydrates, fiber, and protein.', prep: 'Boil or lightly spice with minimal oil.' },
    { name: 'Korola Bhaji (Bitter Gourd)', category: 'Vegetables', serving: '100–200g cooked', reason: 'Contains compounds that may improve glucose tolerance.', prep: 'Lightly fry or boil with minimal oil.' },
    { name: 'Lau Curry (Bottle Gourd)', category: 'Vegetables', serving: '100–200g cooked', reason: 'Very low in calories and carbohydrates, high in water content.', prep: 'Cook as a light curry or soup.' },
    { name: 'Potol Bhaji (Pointed Gourd)', category: 'Vegetables', serving: '100–200g cooked', reason: 'Low in calories, high in vitamins and fiber.', prep: 'Lightly cooked in a mixed vegetable curry.' },
    { name: 'Jhinga Curry (Ridge Gourd)', category: 'Vegetables', serving: '100–200g cooked', reason: 'Low in carbohydrates and high in dietary fiber.', prep: 'Cook with minimal oil.' },
    { name: 'Dherosh Bhaji (Okra)', category: 'Vegetables', serving: '100–200g cooked', reason: 'Rich in soluble fiber which helps slow sugar absorption.', prep: 'Lightly stir-fry or boil.' },
    { name: 'Palong Shak Bhaji (Spinach)', category: 'Vegetables', serving: '100–200g cooked', reason: 'Very low in carbs and rich in vitamins and minerals.', prep: 'Cook with a small amount of oil and garlic.' },
    { name: 'Pui Shak Chorchori', category: 'Vegetables', serving: '100–200g cooked', reason: 'Nutritious leafy green with good fiber content.', prep: 'Can be cooked with lentils or fish.' },
    { name: 'Fresh Cucumber Salad', category: 'Vegetables', serving: '1 medium', reason: 'Hydrating, very low in calories and carbohydrates.', prep: 'Eat raw as a salad before or with meals.' },
    { name: 'Fresh Tomato Salad', category: 'Vegetables', serving: '1 medium', reason: 'Low GI and packed with antioxidants like lycopene.', prep: 'Eat raw in salads or cooked in curries.' },
    { name: 'Fresh Guava', category: 'Fruits', serving: '1 medium fruit', reason: 'Low glycemic index and very high in vitamin C and fiber.', prep: 'Eat fresh with the skin.' },
    { name: 'Ripe Papaya', category: 'Fruits', serving: '1 small bowl', reason: 'Good source of fiber and antioxidants with a moderate GI.', prep: 'Eat fresh in moderation.' },
    { name: 'Fresh Apple', category: 'Fruits', serving: '1 medium fruit', reason: 'Rich in fiber and polyphenols which can improve insulin sensitivity.', prep: 'Eat fresh with the skin.' },
    { name: 'Boiled Egg', category: 'Egg', serving: '1 egg', reason: 'Excellent source of high-quality protein with no carbohydrates.', prep: 'Boiled is preferred over fried.' },
    { name: 'Rui / Katla Fish Curry', category: 'Fish', serving: '80–120g cooked', reason: 'High in protein and healthy fats, with zero carbohydrates.', prep: 'Steamed, boiled, or cooked in a light curry. Avoid deep-frying.' }
];

const diabetesAvoidFoods = [
    { name: 'Regular Soft Drinks', category: 'Drinks', serving: 'Any', reason: 'High in added sugar and may raise blood glucose quickly.', prep: 'Limit significantly or replace with water or unsweetened beverages.' },
    { name: 'Mishti / Sweets (Roshogolla, Rasmalai)', category: 'Snacks & Sweets', serving: 'Any', reason: 'May contribute a large amount of carbohydrate or added sugar.', prep: 'Limit to very small portions on rare occasions.' },
    { name: 'Sweetened Tea / Coffee', category: 'Drinks', serving: '1 cup', reason: 'Added sugar increases blood glucose levels rapidly.', prep: 'Use artificial sweeteners moderately, or consume unsweetened.' },
    { name: 'Jalebi', category: 'Snacks & Sweets', serving: 'Any', reason: 'Deep-fried and high in added sugar, best limited, especially when consumed frequently.', prep: 'Limit intake significantly.' },
    { name: 'Sugary Bakery Items (Cakes, Cookies)', category: 'Snacks & Sweets', serving: 'Any', reason: 'Often contains refined carbohydrates and added sugar.', prep: 'Limit intake; choose whole grain alternatives when possible.' },
    { name: 'Energy Drinks with Added Sugar', category: 'Drinks', serving: 'Any', reason: 'High in added sugar and may raise blood glucose quickly.', prep: 'Best avoided or limited.' },
    { name: 'Sweetened Fruit Drinks', category: 'Drinks', serving: 'Any', reason: 'Lacks fiber and often contains refined carbohydrates and added sugar.', prep: 'Opt for whole fresh fruits instead.' },
    { name: 'Gulab Jamun', category: 'Snacks & Sweets', serving: 'Any', reason: 'May contribute a large amount of carbohydrate or added sugar.', prep: 'Limit significantly.' },
    { name: 'Laddu', category: 'Snacks & Sweets', serving: 'Any', reason: 'Often contains refined carbohydrates and added sugar.', prep: 'Limit to small portions on rare occasions.' },
    { name: 'Cream-filled Bakery Items', category: 'Snacks & Sweets', serving: 'Any', reason: 'Best limited, especially when consumed frequently due to refined carbs and sugar.', prep: 'Choose healthier snack options.' },
    { name: 'Sweet Biscuits', category: 'Snacks & Sweets', serving: 'Any', reason: 'Often contains refined carbohydrates and added sugar.', prep: 'Limit intake.' },
    { name: 'Sugar-coated Biscuits', category: 'Snacks & Sweets', serving: 'Any', reason: 'High in added sugar and may raise blood glucose quickly.', prep: 'Best avoided or limited.' },
    { name: 'Doughnuts', category: 'Snacks & Sweets', serving: 'Any', reason: 'Often contains refined carbohydrates and added sugar.', prep: 'Limit significantly.' },
    { name: 'Sweetened Condensed Milk', category: 'Dairy', serving: 'Any', reason: 'May contribute a large amount of carbohydrate or added sugar.', prep: 'Limit use in tea/coffee and desserts.' },
    { name: 'Ice Cream with Added Sugar', category: 'Snacks & Sweets', serving: 'Any', reason: 'Best limited, especially when consumed frequently.', prep: 'Portion control is essential.' },
    { name: 'Milkshakes with Added Sugar', category: 'Drinks', serving: 'Any', reason: 'High in added sugar and may raise blood glucose quickly.', prep: 'Opt for homemade smoothies without added sugar.' },
    { name: 'Candy / Toffee', category: 'Snacks & Sweets', serving: 'Any', reason: 'High in added sugar and may raise blood glucose quickly.', prep: 'Best avoided or limited.' },
    { name: 'Chocolate Confectionery', category: 'Snacks & Sweets', serving: 'Any', reason: 'May contribute a large amount of carbohydrate or added sugar.', prep: 'Limit intake.' },
    { name: 'Sweetened Breakfast Cereals', category: 'Staple Foods', serving: 'Any', reason: 'Often contains refined carbohydrates and added sugar.', prep: 'Choose unsweetened whole grain cereals.' },
    { name: 'Highly Refined Sugary Snacks', category: 'Snacks & Sweets', serving: 'Any', reason: 'Best limited, especially when consumed frequently.', prep: 'Opt for nuts or seeds instead.' }
];

let currentDiabetesFilter = null;

function setDiabetesGuideFilter(filterType) {
    if (currentDiabetesFilter === filterType) {
        currentDiabetesFilter = null; // Toggle off if clicking the same button
    } else {
        currentDiabetesFilter = filterType;
    }
    
    document.getElementById('diabetes-btn-suitable').classList.remove('active');
    document.getElementById('diabetes-btn-avoid').classList.remove('active');
    
    document.getElementById('diabetes-suitable-search-container').style.display = 'none';
    document.getElementById('diabetes-avoid-search-container').style.display = 'none';
    
    if (currentDiabetesFilter === 'suitable') {
        document.getElementById('diabetes-btn-suitable').classList.add('active');
        document.getElementById('diabetes-suitable-search-container').style.display = 'block';
    } else if (currentDiabetesFilter === 'avoid') {
        document.getElementById('diabetes-btn-avoid').classList.add('active');
        document.getElementById('diabetes-avoid-search-container').style.display = 'block';
    }
    
    renderDiabetesGuide();
}

function renderDiabetesGuide() {
    const list = document.getElementById('diabetes-guide-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (!currentDiabetesFilter) {
        list.style.display = 'none';
        return;
    }
    
    list.style.display = 'flex';
    
    let foodsToRender = currentDiabetesFilter === 'suitable' ? diabetesFoods : diabetesAvoidFoods;
    
    const searchInput = currentDiabetesFilter === 'suitable' ? 
        document.getElementById('diabetes-suitable-search') : 
        document.getElementById('diabetes-avoid-search');
        
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    if (query) {
        foodsToRender = foodsToRender.filter(food => food.name.toLowerCase().includes(query));
    }
    
    if (foodsToRender.length === 0) {
        list.innerHTML = '<div class="no-results" style="padding: 20px; text-align: center; color: #666;">No food found</div>';
        return;
    }
    
    foodsToRender.forEach(food => {
        const card = document.createElement('div');
        card.className = 'food-card';
        card.innerHTML = `
            <div class="food-info-area" style="flex: 1; min-width: 0;">
                <h3 class="food-name">${food.name}</h3>
                <div class="food-nutrition" style="margin-top: 4px;">
                    <span class="nutrition-badge">Suggested Serving: ${food.serving}</span>
                </div>
                <p class="food-method" style="margin-top: 6px; color: #333;"><strong>${currentDiabetesFilter === 'suitable' ? 'Why it can be included:' : 'Why to limit/avoid:'}</strong> ${food.reason}</p>
                <p class="food-method" style="margin-top: 4px; color: #c53030;"><strong>Preparation/Portion Note:</strong> ${food.prep}</p>
            </div>
        `;
        list.appendChild(card);
    });
}

