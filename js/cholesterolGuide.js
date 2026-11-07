const cholesterolFoods = [
    { name: 'Atta Roti', category: 'Staple Foods', serving: '1 medium piece', reason: 'Can be part of a heart-healthy eating pattern. Whole grains provide fiber that helps manage cholesterol.', prep: 'Make without added oil or ghee.' },
    { name: 'Plain Brown/Red Rice', category: 'Staple Foods', serving: '100–150g cooked per meal', reason: 'Can be part of a heart-healthy eating pattern. Contains more fiber than white rice.', prep: 'Portion control is key. Boil rather than frying.' },
    { name: 'Masoor Dal', category: 'Lentils & Dal', serving: '100–150g cooked', reason: 'Can be part of a heart-healthy eating pattern. High in soluble fiber which binds to cholesterol.', prep: 'Avoid excessive ghee/butter/oil during preparation.' },
    { name: 'Moong Dal', category: 'Lentils & Dal', serving: '100–150g cooked', reason: 'Can be part of a heart-healthy eating pattern. Plant-based protein free from saturated fats.', prep: 'Avoid excessive ghee/butter/oil.' },
    { name: 'Chola Bhuna (Lightly Spiced)', category: 'Lentils & Dal', serving: '100–150g cooked', reason: 'Can be part of a heart-healthy eating pattern. Rich in soluble fiber.', prep: 'Lightly spiced, avoid deep frying.' },
    { name: 'Rajma Curry', category: 'Lentils & Dal', serving: '100–150g cooked', reason: 'Can be part of a heart-healthy eating pattern. Excellent source of cholesterol-lowering soluble fiber.', prep: 'Cook with limited oil.' },
    { name: 'Dherosh Bhaji (Okra)', category: 'Vegetables', serving: '100–200g cooked', reason: 'Can be part of a heart-healthy eating pattern. The mucilage (gel) binds to cholesterol during digestion.', prep: 'Lightly cooked with limited oil.' },
    { name: 'Begun Pora / Mashed Eggplant', category: 'Vegetables', serving: '100–200g cooked', reason: 'Can be part of a heart-healthy eating pattern. High in fiber and antioxidants.', prep: 'Bake, roast, or lightly cook. Avoid deep-frying.' },
    { name: 'Lau Curry (Bottle Gourd)', category: 'Vegetables', serving: '100–200g cooked', reason: 'Can be part of a heart-healthy eating pattern. Low in calories and fat.', prep: 'Lightly cooked with limited oil.' },
    { name: 'Badhakopi Bhaji (Cabbage)', category: 'Vegetables', serving: '100–200g cooked', reason: 'Can be part of a heart-healthy eating pattern. High in fiber and heart-healthy nutrients.', prep: 'Lightly cooked or eaten raw in salads.' },
    { name: 'Palong Shak Bhaji (Spinach)', category: 'Vegetables', serving: '100–200g cooked', reason: 'Can be part of a heart-healthy eating pattern. Contains lutein which may protect against arterial wall thickening.', prep: 'Lightly cooked with limited oil.' },
    { name: 'Pui Shak Chorchori', category: 'Vegetables', serving: '100–200g cooked', reason: 'Can be part of a heart-healthy eating pattern. Good source of dietary fiber.', prep: 'Lightly cooked with limited oil.' },
    { name: 'Fresh Guava', category: 'Fruits', serving: '1 medium fruit', reason: 'Can be part of a heart-healthy eating pattern. Rich in soluble fiber and antioxidants.', prep: 'Eat fresh.' },
    { name: 'Ripe Papaya', category: 'Fruits', serving: '1 small bowl', reason: 'Can be part of a heart-healthy eating pattern. Contains antioxidants that prevent cholesterol oxidation.', prep: 'Eat fresh.' },
    { name: 'Fresh Orange', category: 'Fruits', serving: '1 medium fruit', reason: 'Can be part of a heart-healthy eating pattern. Rich in pectin, a cholesterol-lowering fiber.', prep: 'Eat whole fruit rather than juice.' },
    { name: 'Fresh Apple', category: 'Fruits', serving: '1 medium fruit', reason: 'Can be part of a heart-healthy eating pattern. High in pectin and polyphenols.', prep: 'Eat whole with the skin.' },
    { name: 'Rui Fish Curry (Light Jhol)', category: 'Fish', serving: '80–120g cooked', reason: 'Can be part of a heart-healthy eating pattern. Good source of protein and some omega-3s.', prep: 'Steamed, boiled, baked, grilled or lightly cooked rather than deep-fried.' },
    { name: 'Tilapia Fish Curry', category: 'Fish', serving: '80–120g cooked', reason: 'Can be part of a heart-healthy eating pattern. Lean protein source.', prep: 'Steamed, boiled, baked, grilled or lightly cooked rather than deep-fried.' },
    { name: 'Chicken Curry (Skinless)', category: 'Meat', serving: '80–120g cooked', reason: 'Can be part of a heart-healthy eating pattern. Lean protein lower in saturated fat than red meat.', prep: 'Ensure it is skinless and cooked with limited oil.' },
    { name: 'Low-Fat Tok Doi', category: 'Dairy', serving: '100–150g', reason: 'Can be part of a heart-healthy eating pattern. Provides dairy benefits without high saturated fat.', prep: 'Prefer low-fat/unsweetened versions.' }
];

const cholesterolAvoidFoods = [
    { name: 'Fatty Beef Curry / Bhuna', category: 'Meat', serving: 'Any', reason: 'High in saturated fat and best limited when managing high cholesterol.', prep: 'Limit intake; choose lean cuts and trim visible fat before cooking.' },
    { name: 'Beef Fat / Tallow (in cooking)', category: 'Meat', serving: 'Any', reason: 'Very high in saturated fat and best limited when managing high cholesterol.', prep: 'Avoid cooking with pure animal fat.' },
    { name: 'Mutton Curry (with fat)', category: 'Meat', serving: 'Any', reason: 'High in saturated fat and best limited when managing high cholesterol.', prep: 'Limit intake; opt for lean cuts.' },
    { name: 'Beef Bhuna (High Oil/Fat)', category: 'Meat', serving: 'Any', reason: 'Often prepared with excess oil and fat, best limited.', prep: 'Use minimal oil and lean meat when preparing.' },
    { name: 'Processed Sausages / Salami', category: 'Meat', serving: 'Any', reason: 'Processed meat may contain higher amounts of saturated fat and sodium.', prep: 'Limit intake significantly.' },
    { name: 'Bacon', category: 'Meat', serving: 'Any', reason: 'High in saturated fat and sodium.', prep: 'Best avoided or limited.' },
    { name: 'Deep-Fried Singara', category: 'Snacks & Fast Food', serving: 'Any', reason: 'Deep-frying can substantially increase the fat content, often with trans fats.', prep: 'Limit frequent consumption.' },
    { name: 'Deep-Fried Puri', category: 'Snacks & Fast Food', serving: 'Any', reason: 'Deep-frying can substantially increase the fat content.', prep: 'Opt for dry-roasted or baked alternatives.' },
    { name: 'Deep-Fried Samosa', category: 'Snacks & Fast Food', serving: 'Any', reason: 'Deep-frying can substantially increase the fat content.', prep: 'Limit frequent consumption.' },
    { name: 'Deep-Fried Chicken', category: 'Snacks & Fast Food', serving: 'Any', reason: 'Deep-frying can substantially increase the fat content.', prep: 'Choose grilled or baked chicken instead.' },
    { name: 'French Fries', category: 'Snacks & Fast Food', serving: 'Any', reason: 'Deep-frying can substantially increase the fat content.', prep: 'Limit intake.' },
    { name: 'Packaged Potato Chips', category: 'Snacks & Fast Food', serving: 'Any', reason: 'Often high in unhealthy fats and sodium.', prep: 'Choose baked snacks or unsalted nuts.' },
    { name: 'Oil-Fried Paratha', category: 'Staple Foods', serving: 'Any', reason: 'High in saturated fat when made with large amounts of oil or ghee.', prep: 'Make with minimal healthy oil or dry roast.' },
    { name: 'Bakery Pastries', category: 'Snacks & Fast Food', serving: 'Any', reason: 'Often high in saturated fat and sometimes trans fats.', prep: 'Limit intake.' },
    { name: 'Cream-Filled Cakes', category: 'Snacks & Fast Food', serving: 'Any', reason: 'High in saturated fat and added sugar.', prep: 'Best limited.' },
    { name: 'Butter-Rich Cookies', category: 'Snacks & Fast Food', serving: 'Any', reason: 'High in saturated fat and best limited when managing high cholesterol.', prep: 'Limit intake.' },
    { name: 'Full-Fat Cow Milk', category: 'Dairy', serving: 'Any', reason: 'Contains higher saturated fat compared to skim milk.', prep: 'Consider low-fat or skim milk alternatives.' },
    { name: 'Full-Fat Cream (Malai)', category: 'Dairy', serving: 'Any', reason: 'High in saturated fat and best limited when managing high cholesterol.', prep: 'Limit use in cooking and desserts.' },
    { name: 'High-Fat Cheese', category: 'Dairy', serving: 'Any', reason: 'High in saturated fat and best limited when managing high cholesterol.', prep: 'Use in small portions or opt for lower-fat versions.' },
    { name: 'Butter (in cooking/baking)', category: 'Dairy', serving: 'Any', reason: 'High in saturated fat and best limited when managing high cholesterol.', prep: 'Use sparingly or substitute with healthy oils.' },
    { name: 'Ghee (in rice/curries)', category: 'Dairy', serving: 'Any', reason: 'High in saturated fat and best limited when managing high cholesterol.', prep: 'Use very sparingly for flavor only.' },
    { name: 'Vanaspati / Dalda (in sweets/cooking)', category: 'Dairy', serving: 'Any', reason: 'Often contains trans fats which are particularly harmful for cholesterol levels.', prep: 'Best avoided.' }
];

let currentCholesterolFilter = null;

function setCholesterolGuideFilter(filterType) {
    if (currentCholesterolFilter === filterType) {
        currentCholesterolFilter = null; // Toggle off if clicking the same button
    } else {
        currentCholesterolFilter = filterType;
    }
    
    document.getElementById('cholesterol-btn-suitable').classList.remove('active');
    document.getElementById('cholesterol-btn-avoid').classList.remove('active');
    
    document.getElementById('cholesterol-suitable-search-container').style.display = 'none';
    document.getElementById('cholesterol-avoid-search-container').style.display = 'none';
    
    if (currentCholesterolFilter === 'suitable') {
        document.getElementById('cholesterol-btn-suitable').classList.add('active');
        document.getElementById('cholesterol-suitable-search-container').style.display = 'block';
    } else if (currentCholesterolFilter === 'avoid') {
        document.getElementById('cholesterol-btn-avoid').classList.add('active');
        document.getElementById('cholesterol-avoid-search-container').style.display = 'block';
    }
    
    renderCholesterolGuide();
}

function renderCholesterolGuide() {
    const list = document.getElementById('cholesterol-guide-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (!currentCholesterolFilter) {
        list.style.display = 'none';
        return;
    }
    
    list.style.display = 'flex';
    
    let foodsToRender = currentCholesterolFilter === 'suitable' ? cholesterolFoods : cholesterolAvoidFoods;
    
    const searchInput = currentCholesterolFilter === 'suitable' ? 
        document.getElementById('cholesterol-suitable-search') : 
        document.getElementById('cholesterol-avoid-search');
        
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
                <p class="food-method" style="margin-top: 6px; color: #333;"><strong>${currentCholesterolFilter === 'suitable' ? 'Why it can be included:' : 'Why to limit/avoid:'}</strong> ${food.reason}</p>
                <p class="food-method" style="margin-top: 4px; color: #c53030;"><strong>Preparation Note:</strong> ${food.prep}</p>
            </div>
        `;
        list.appendChild(card);
    });
}

// --- Local Storage Logic ---
