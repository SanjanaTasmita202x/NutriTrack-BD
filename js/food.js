const foodDatabase = [
    // 1. STAPLES
    { id: 'f1', name: 'Plain Rice (\u09AD\u09BE\u09A4)', category: 'Rice', caloriesPer100g: 130, servingSize: '100-150g', description: 'Staple white rice, cooked' },
    { id: 'f2', name: 'Brown Rice (\u09B2\u09BE\u09B2 \u099A\u09BE\u09B2\u09C7\u09B0 \u09AD\u09BE\u09A4)', category: 'Rice', caloriesPer100g: 111, servingSize: '100-150g', description: 'Whole grain rice, cooked' },
    { id: 'f4', name: 'Flattened Rice (\u099A\u09BF\u0981\u09DC\u09BE)', category: 'Rice', caloriesPer100g: 346, servingSize: '30-40g', description: 'Dry beaten rice' },
    { id: 'f5', name: 'Puffed Rice (\u09AE\u09C1\u09DC\u09BF)', category: 'Rice', caloriesPer100g: 402, servingSize: '1 cup', description: 'Puffed rice snack' },
    { id: 'f3', name: 'Whole Wheat Roti (\u09B0\u09C1\u099F\u09BF)', category: 'Bread', caloriesPer100g: 297, servingSize: '1 piece', description: 'Flatbread made from whole wheat' },
    { id: 'f54', name: 'Paratha (\u09AA\u09B0\u09CB\u099F\u09BE)', category: 'Bread', caloriesPer100g: 320, servingSize: '1 piece', description: 'Flaky pan-fried flatbread' },
    { id: 'f55', name: 'Naan Bread (\u09A8\u09BE\u09A8 \u09B0\u09C1\u099F\u09BF)', category: 'Bread', caloriesPer100g: 290, servingSize: '1 piece', description: 'Oven-baked flatbread' },
    { id: 'f53', name: 'Polao (\u09AA\u09CB\u09B2\u09BE\u0993)', category: 'Rice', caloriesPer100g: 180, servingSize: '150g', description: 'Aromatic seasoned rice' },
    { id: 'f52', name: 'Vegetable Khichuri (\u09B8\u09AC\u099C\u09BF \u0996\u09BF\u099A\u09C1\u09DC\u09BF)', category: 'Rice', caloriesPer100g: 150, servingSize: '200g', description: 'Rice and lentils with vegetables' },
    { id: 'f51', name: 'Chicken Biryani (\u099A\u09BF\u0995\u09C7\u09A8 \u09AC\u09BF\u09B0\u09BF\u09DF\u09BE\u09A8\u09BF)', category: 'Rice', caloriesPer100g: 200, servingSize: '250g', description: 'Spiced rice with chicken' },
    { id: 'f80', name: 'Mutton Biryani (\u09AE\u09BE\u099F\u09A8 \u09AC\u09BF\u09B0\u09BF\u09DF\u09BE\u09A8\u09BF)', category: 'Rice', caloriesPer100g: 220, servingSize: '250g', description: 'Spiced rice with mutton' },
    { id: 'f81', name: 'Beef Biryani (\u09AC\u09BF\u09AB \u09AC\u09BF\u09B0\u09BF\u09DF\u09BE\u09A8\u09BF)', category: 'Rice', caloriesPer100g: 230, servingSize: '250g', description: 'Spiced rice with beef' },

    // 2. LENTILS & DAL
    { id: 'f6', name: 'Red Lentil Soup (\u09AE\u09B8\u09C1\u09B0 \u09A1\u09BE\u09B2)', category: 'Lentils', caloriesPer100g: 116, servingSize: '150g', description: 'Cooked red lentil soup' },
    { id: 'f7', name: 'Yellow Lentil Soup (\u09AE\u09C1\u0997 \u09A1\u09BE\u09B2)', category: 'Lentils', caloriesPer100g: 105, servingSize: '150g', description: 'Cooked yellow lentil soup' },
    { id: 'f8', name: 'Chickpeas Curry (\u099B\u09CB\u09B2\u09BE \u09AD\u09C1\u09A8\u09BE)', category: 'Lentils', caloriesPer100g: 164, servingSize: '150g', description: 'Spiced chickpeas' },
    { id: 'f9', name: 'Kidney Beans Curry (\u09B0\u09BE\u099C\u09AE\u09BE \u09A4\u09B0\u0995\u09BE\u09B0\u09BF)', category: 'Lentils', caloriesPer100g: 127, servingSize: '150g', description: 'Spiced red kidney beans' },

    // 3. FISH
    { id: 'f38', name: 'Rui Fish Curry (\u09B0\u09C1\u0987 \u09AE\u09BE\u099B\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Fish', caloriesPer100g: 140, servingSize: '1 piece with gravy', description: 'Traditional Rui fish curry' },
    { id: 'f39', name: 'Katla Fish Curry (\u0995\u09BE\u09A4\u09B2\u09BE \u09AE\u09BE\u099B\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Fish', caloriesPer100g: 140, servingSize: '1 piece with gravy', description: 'Traditional Katla fish curry' },
    { id: 'f41', name: 'Pangas Fish Curry (\u09AA\u09BE\u0999\u09CD\u0997\u09BE\u09B8 \u09AE\u09BE\u099B\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Fish', caloriesPer100g: 150, servingSize: '1 piece with gravy', description: 'Pangas fish in rich curry' },
    { id: 'f40', name: 'Tilapia Fish Fry (\u09A4\u09C7\u09B2\u09BE\u09AA\u09BF\u09DF\u09BE \u09AE\u09BE\u099B \u09AD\u09BE\u099C\u09BE)', category: 'Fish', caloriesPer100g: 180, servingSize: '1 piece', description: 'Pan-fried Tilapia fish' },
    { id: 'f89', name: 'Fish Fry (\u09AE\u09BE\u099B \u09AD\u09BE\u099C\u09BE)', category: 'Fish', caloriesPer100g: 190, servingSize: '1 piece', description: 'Pan-fried local fish piece' },
    { id: 'f82', name: 'Pabda Fish Curry (\u09AA\u09BE\u09AC\u09A6\u09BE \u09AE\u09BE\u099B\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Fish', caloriesPer100g: 130, servingSize: '1 piece with gravy', description: 'Pabda fish in light curry' },
    { id: 'f83', name: 'Tengra Fish Curry (\u099F\u09C7\u0982\u09B0\u09BE \u09AE\u09BE\u099B\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Fish', caloriesPer100g: 120, servingSize: '100g with gravy', description: 'Small Tengra fish curry' },
    { id: 'f84', name: 'Koi Fish Curry (\u0995\u0987 \u09AE\u09BE\u099B\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Fish', caloriesPer100g: 135, servingSize: '1 piece with gravy', description: 'Traditional Koi fish curry' },
    { id: 'f85', name: 'Magur Fish Curry (\u09AE\u09BE\u0997\u09C1\u09B0 \u09AE\u09BE\u099B\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Fish', caloriesPer100g: 125, servingSize: '1 piece with gravy', description: 'Catfish curry' },
    { id: 'f37', name: 'Steamed Hilsa (\u0987\u09B2\u09BF\u09B6 \u09AD\u09BE\u09AA\u09BE)', category: 'Fish', caloriesPer100g: 275, servingSize: '100g', description: 'Steamed Hilsa fish in mustard sauce' },
    { id: 'f56', name: 'Mashed Fish (\u09AE\u09BE\u099B\u09C7\u09B0 \u09AD\u09B0\u09CD\u09A4\u09BE)', category: 'Fish', caloriesPer100g: 150, servingSize: '50g', description: 'Mashed fish with onion and chili' },
    { id: 'f42', name: 'Shrimp Curry (\u099A\u09BF\u0982\u09DC\u09BF \u09AE\u09BE\u099B\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Fish', caloriesPer100g: 160, servingSize: '100g', description: 'Spiced shrimp curry' },

    // 4. MEAT
    { id: 'f44', name: 'Beef Curry (\u0997\u09B0\u09C1\u09B0 \u09AE\u09BE\u0982\u09B8\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Meat', caloriesPer100g: 280, servingSize: '100g', description: 'Spicy beef curry' },
    { id: 'f58', name: 'Beef Kabab (\u0997\u09B0\u09C1\u09B0 \u09AE\u09BE\u0982\u09B8\u09C7\u09B0 \u0995\u09BE\u09AC\u09BE\u09AC)', category: 'Meat', caloriesPer100g: 250, servingSize: '2 pieces', description: 'Minced or chunk beef kabab' },
    { id: 'f59', name: 'Beef Steak (\u09AC\u09BF\u09AB \u09B8\u09CD\u099F\u09C7\u0995)', category: 'Meat', caloriesPer100g: 270, servingSize: '150g', description: 'Grilled or pan-seared beef steak' },
    { id: 'f43', name: 'Chicken Curry (\u09AE\u09C1\u09B0\u0997\u09BF\u09B0 \u09AE\u09BE\u0982\u09B8\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Meat', caloriesPer100g: 180, servingSize: '100g', description: 'Traditional chicken curry with bone' },
    { id: 'f61', name: 'Chicken Fry (\u09AE\u09C1\u09B0\u0997\u09BF\u09B0 \u09AE\u09BE\u0982\u09B8 \u09AD\u09BE\u099C\u09BE)', category: 'Meat', caloriesPer100g: 250, servingSize: '1 piece', description: 'Fried chicken piece' },
    { id: 'f62', name: 'Chicken Roast (\u09AE\u09C1\u09B0\u0997\u09BF\u09B0 \u09B0\u09CB\u09B8\u09CD\u099F)', category: 'Meat', caloriesPer100g: 220, servingSize: '1 piece', description: 'Rich, mildly sweet chicken roast' },
    { id: 'f63', name: 'Grilled Chicken (\u0997\u09CD\u09B0\u09BF\u09B2\u09CD\u09A1 \u099A\u09BF\u0995\u09C7\u09A8)', category: 'Meat', caloriesPer100g: 190, servingSize: '1 piece', description: 'Spiced grilled chicken' },
    { id: 'f64', name: 'Mutton Curry (\u0996\u09BE\u09B8\u09BF\u09B0 \u09AE\u09BE\u0982\u09B8\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Meat', caloriesPer100g: 290, servingSize: '100g', description: 'Traditional mutton curry' },
    { id: 'f65', name: 'Mutton Rezala (\u0996\u09BE\u09B8\u09BF\u09B0 \u09B0\u09C7\u099C\u09BE\u09B2\u09BE)', category: 'Meat', caloriesPer100g: 310, servingSize: '100g', description: 'Rich mutton curry with yogurt/cashew' },
    { id: 'f66', name: 'Duck Curry (\u09B9\u09BE\u0981\u09B8\u09C7\u09B0 \u09AE\u09BE\u0982\u09B8\u09C7\u09B0 \u099D\u09CB\u09B2)', category: 'Meat', caloriesPer100g: 330, servingSize: '100g', description: 'Rich and spicy duck curry' },

    // 5. EGG
    { id: 'f45', name: 'Boiled Egg (\u09B8\u09C7\u09A6\u09CD\u09A7 \u09A1\u09BF\u09AE)', category: 'Egg', caloriesPer100g: 155, servingSize: '1 egg', description: 'Hard or soft boiled egg' },
    { id: 'f67', name: 'Fried Egg (\u09A1\u09BF\u09AE \u09AD\u09BE\u099C\u09BE)', category: 'Egg', caloriesPer100g: 190, servingSize: '1 egg', description: 'Egg fried in oil' },
    { id: 'f68', name: 'Egg Curry (\u09A1\u09BF\u09AE\u09C7\u09B0 \u09A4\u09B0\u0995\u09BE\u09B0\u09BF)', category: 'Egg', caloriesPer100g: 180, servingSize: '1 egg with gravy', description: 'Spicy egg curry' },
    { id: 'f69', name: 'Poached Egg (\u09A1\u09BF\u09AE \u09AA\u09CB\u099A)', category: 'Egg', caloriesPer100g: 143, servingSize: '1 egg', description: 'Egg poached in water' },

    // 6. VEGETABLES
    { id: 'f10', name: 'Potato Fry (\u0986\u09B2\u09C1 \u09AD\u09BE\u099C\u09BF)', category: 'Veg', caloriesPer100g: 150, servingSize: '100g', description: 'Fried or saut\u00e9ed potato strips' },
    { id: 'f73', name: 'Mashed Potato (\u0986\u09B2\u09C1 \u09AD\u09B0\u09CD\u09A4\u09BE)', category: 'Veg', caloriesPer100g: 130, servingSize: '50g', description: 'Mashed potato with onion and chili' },
    { id: 'f11', name: 'Boiled Sweet Potato (\u09AE\u09BF\u09B8\u09CD\u099F\u09BF \u0986\u09B2\u09C1 \u09B8\u09C7\u09A6\u09CD\u09A7)', category: 'Veg', caloriesPer100g: 86, servingSize: '1 medium', description: 'Boiled or baked sweet potato' },
    { id: 'f12', name: 'Bottle Gourd Curry (\u09B2\u09BE\u0989 \u09A4\u09B0\u0995\u09BE\u09B0\u09BF)', category: 'Veg', caloriesPer100g: 30, servingSize: '150g', description: 'Cooked bottle gourd curry' },
    { id: 'f86', name: 'Bottle Gourd with Shrimp (\u099A\u09BF\u0982\u09DC\u09BF \u09A6\u09BF\u09DF\u09C7 \u09B2\u09BE\u0989)', category: 'Veg', caloriesPer100g: 70, servingSize: '150g', description: 'Bottle gourd cooked with small shrimp' },
    { id: 'f13', name: 'Pointed Gourd Curry (\u09AA\u099F\u09B2 \u09A4\u09B0\u0995\u09BE\u09B0\u09BF)', category: 'Veg', caloriesPer100g: 50, servingSize: '100g', description: 'Pointed gourd cooked in spices' },
    { id: 'f87', name: 'Stuffed Pointed Gourd (\u09AA\u099F\u09B2 \u09A6\u09CB\u09B2\u09AE\u09BE)', category: 'Veg', caloriesPer100g: 110, servingSize: '100g', description: 'Pointed gourd stuffed with spices/mince' },
    { id: 'f14', name: 'Bitter Gourd Fry (\u0995\u09B0\u09B2\u09BE \u09AD\u09BE\u099C\u09BF)', category: 'Veg', caloriesPer100g: 90, servingSize: '100g', description: 'Pan-fried bitter gourd' },
    { id: 'f15', name: 'Eggplant Fry (\u09AC\u09C7\u0997\u09C1\u09A8 \u09AD\u09BE\u099C\u09BE)', category: 'Veg', caloriesPer100g: 180, servingSize: '2 slices', description: 'Pan-fried spiced eggplant slices' },
    { id: 'f88', name: 'Eggplant Curry (\u09AC\u09C7\u0997\u09C1\u09A8 \u09A4\u09B0\u0995\u09BE\u09B0\u09BF)', category: 'Veg', caloriesPer100g: 80, servingSize: '100g', description: 'Cooked eggplant in spiced gravy' },
    { id: 'f16', name: 'Ridge Gourd Curry (\u099D\u09BF\u0999\u09C7 \u09A4\u09B0\u0995\u09BE\u09B0\u09BF)', category: 'Veg', caloriesPer100g: 40, servingSize: '100g', description: 'Lightly spiced ridge gourd' },
    { id: 'f17', name: 'Sponge Gourd Curry (\u09A7\u09C1\u09A8\u09CD\u09A6\u09C1\u09B2 \u09A4\u09B0\u0995\u09BE\u09B0\u09BF)', category: 'Veg', caloriesPer100g: 40, servingSize: '100g', description: 'Lightly spiced sponge gourd' },
    { id: 'f18', name: 'Okra Fry (\u09A2\u09C7\u0981\u09DC\u09B8 \u09AD\u09BE\u099C\u09BF)', category: 'Veg', caloriesPer100g: 110, servingSize: '100g', description: 'Pan-fried okra' },
    { id: 'f19', name: 'Yardlong Bean Fry (\u09AC\u09B0\u09AC\u099F\u09BF \u09AD\u09BE\u099C\u09BF)', category: 'Veg', caloriesPer100g: 120, servingSize: '100g', description: 'Stir-fried long beans' },
    { id: 'f20', name: 'Green Bean Fry (\u09B8\u09AC\u09C1\u099C \u09B6\u09BF\u09AE \u09AD\u09BE\u099C\u09BF)', category: 'Veg', caloriesPer100g: 100, servingSize: '100g', description: 'Stir-fried green beans' },
    { id: 'f21', name: 'Pumpkin Curry (\u09AE\u09BF\u09B8\u09CD\u099F\u09BF \u0995\u09C1\u09AE\u09DC\u09BE\u09B0 \u09A4\u09B0\u0995\u09BE\u09B0\u09BF)', category: 'Veg', caloriesPer100g: 60, servingSize: '100g', description: 'Spiced pumpkin curry' },
    { id: 'f22', name: 'Cauliflower Curry (\u09AB\u09C1\u09B2\u0995\u09AA\u09BF\u09B0 \u09A4\u09B0\u0995\u09BE\u09B0\u09BF)', category: 'Veg', caloriesPer100g: 70, servingSize: '100g', description: 'Cooked cauliflower in spices' },
    { id: 'f23', name: 'Cabbage Fry (\u09AC\u09BE\u0981\u09A7\u09BE\u0995\u09AA\u09BF \u09AD\u09BE\u099C\u09BF)', category: 'Veg', caloriesPer100g: 80, servingSize: '100g', description: 'Stir-fried cabbage' },
    { id: 'f24', name: 'Spinach Fry (\u09AA\u09BE\u09B2\u0982 \u09B6\u09BE\u0995 \u09AD\u09BE\u099C\u09BF)', category: 'Veg', caloriesPer100g: 70, servingSize: '100g', description: 'Stir-fried spinach' },
    { id: 'f25', name: 'Malabar Spinach Fry (\u09AA\u09C1\u0981\u0987 \u09B6\u09BE\u0995 \u09AD\u09BE\u099C\u09BF)', category: 'Veg', caloriesPer100g: 70, servingSize: '100g', description: 'Stir-fried Malabar spinach' },
    { id: 'f26', name: 'Red Amaranth Fry (\u09B2\u09BE\u09B2 \u09B6\u09BE\u0995 \u09AD\u09BE\u099C\u09BF)', category: 'Veg', caloriesPer100g: 70, servingSize: '100g', description: 'Stir-fried red amaranth' },
    { id: 'f27', name: 'Water Spinach Fry (\u0995\u09B2\u09AE\u09BF \u09B6\u09BE\u0995 \u09AD\u09BE\u099C\u09BF)', category: 'Veg', caloriesPer100g: 70, servingSize: '100g', description: 'Stir-fried water spinach' },
    { id: 'f74', name: 'Mixed Vegetable Curry (\u09B8\u09AC\u099C\u09BF \u09A4\u09B0\u0995\u09BE\u09B0\u09BF)', category: 'Veg', caloriesPer100g: 90, servingSize: '150g', description: 'Assorted vegetables cooked together' },
    { id: 'f28', name: 'Cucumber Salad (\u09B6\u09B8\u09BE \u09B8\u09BE\u09B2\u09BE\u09A6)', category: 'Veg', caloriesPer100g: 15, servingSize: '1 medium', description: 'Fresh cucumber slices' },
    { id: 'f29', name: 'Tomato Salad (\u099F\u09AE\u09C7\u099F\u09CB \u09B8\u09BE\u09B2\u09BE\u09A6)', category: 'Veg', caloriesPer100g: 18, servingSize: '1 medium', description: 'Fresh tomato slices' },
    { id: 'f30', name: 'Carrot Salad (\u0997\u09BE\u099C\u09B0 \u09B8\u09BE\u09B2\u09BE\u09A6)', category: 'Veg', caloriesPer100g: 41, servingSize: '1 medium', description: 'Fresh grated or sliced carrot' },

    // 7. FRUITS
    { id: 'f31', name: 'Guava (\u09AA\u09C7\u09DF\u09BE\u09B0\u09BE)', category: 'Fruit', caloriesPer100g: 68, servingSize: '1 medium fruit', description: 'Fresh fruit' },
    { id: 'f32', name: 'Papaya (\u09AA\u09C7\u0981\u09AA\u09C7)', category: 'Fruit', caloriesPer100g: 43, servingSize: '1 small bowl', description: 'Fresh ripe papaya' },
    { id: 'f33', name: 'Banana (\u0995\u09B2\u09BE)', category: 'Fruit', caloriesPer100g: 89, servingSize: '1 medium fruit', description: 'Fresh fruit' },
    { id: 'f34', name: 'Orange (\u0995\u09AE\u09B2\u09BE)', category: 'Fruit', caloriesPer100g: 47, servingSize: '1 medium fruit', description: 'Fresh fruit' },
    { id: 'f35', name: 'Mango (\u0986\u09AE)', category: 'Fruit', caloriesPer100g: 60, servingSize: '1 medium fruit', description: 'Fresh ripe mango' },
    { id: 'f36', name: 'Apple (\u0986\u09AA\u09C7\u09B2)', category: 'Fruit', caloriesPer100g: 52, servingSize: '1 medium fruit', description: 'Fresh fruit' },
    { id: 'f50', name: 'Coconut Water (\u09A1\u09BE\u09AC\u09C7\u09B0 \u09AA\u09BE\u09A8\u09BF)', category: 'Fruit', caloriesPer100g: 19, servingSize: '1 cup', description: 'Fresh coconut water' },
    { id: 'f49', name: 'Lemon Juice (\u09B2\u09C7\u09AC\u09C1\u09B0 \u09B0\u09B8)', category: 'Fruit', caloriesPer100g: 29, servingSize: '1 medium', description: 'Fresh lemon juice' },

    // 8. DAIRY
    { id: 'f47', name: 'Cow Milk (\u0997\u09B0\u09C1\u09B0 \u09A6\u09C1\u09A7)', category: 'Dairy', caloriesPer100g: 61, servingSize: '1 cup (250ml)', description: 'Full fat cow milk' },
    { id: 'f70', name: 'Low-Fat Milk (\u09A8\u09A8\u09C0\u09AE\u09C1\u0995\u09CD\u09A4 \u09A6\u09C1\u09A7)', category: 'Dairy', caloriesPer100g: 42, servingSize: '1 cup (250ml)', description: 'Dairy milk, reduced fat' },
    { id: 'f72', name: 'Milk Powder (\u0997\u09C1\u0981\u09DC\u09CB \u09A6\u09C1\u09A7)', category: 'Dairy', caloriesPer100g: 496, servingSize: '2 tbsp (15g)', description: 'Dried milk powder' },
    { id: 'f46', name: 'Plain Yogurt (\u099F\u0995 \u09A6\u0987)', category: 'Dairy', caloriesPer100g: 63, servingSize: '100-150g', description: 'Unsweetened plain yogurt' },
    { id: 'f71', name: 'Sweet Yogurt (\u09AE\u09BF\u09B8\u09CD\u099F\u09BF \u09A6\u0987)', category: 'Dairy', caloriesPer100g: 150, servingSize: '100g', description: 'Sweetened set yogurt' },

    // 9. OTHER
    { id: 'f48', name: 'Peanuts (\u099A\u09BF\u09A8\u09BE\u09AC\u09BE\u09A6\u09BE\u09AE)', category: 'Other', caloriesPer100g: 567, servingSize: '30g', description: 'Roasted unsalted nuts' }
];

// --- Food Library Rendering ---

const UI_CATEGORIES = [
    { id: 'Staple Foods', icon: '\u{1F33E}', rawCategories: ['Rice', 'Bread'] },
    { id: 'Lentils & Dal', icon: '\u{1F963}', rawCategories: ['Lentils'] },
    { id: 'Fish', icon: '\u{1F41F}', rawCategories: ['Fish'] },
    { id: 'Meat', icon: '\u{1F969}', rawCategories: ['Meat'] },
    { id: 'Egg', icon: '\u{1F95A}', rawCategories: ['Egg'] },
    { id: 'Vegetables', icon: '\u{1F957}', rawCategories: ['Veg'] },
    { id: 'Fruits', icon: '\u{1F34E}', rawCategories: ['Fruit'] },
    { id: 'Dairy', icon: '\u{1F95B}', rawCategories: ['Dairy'] },
    { id: 'Other', icon: '\u{1F37D}', rawCategories: ['Other'] }
];

function getCategoryEmoji(rawCategory) {
    if (rawCategory === 'Rice') return '\u{1F35A}';
    if (rawCategory === 'Bread') return '\u{1F35E}';
    if (rawCategory === 'Veg') return '\u{1F966}';
    if (rawCategory === 'Fruit') return '\u{1F349}';
    if (rawCategory === 'Fish') return '\u{1F41F}';
    if (rawCategory === 'Meat') return '\u{1F357}';
    if (rawCategory === 'Egg') return '\u{1F95A}';
    if (rawCategory === 'Lentils') return '\u{1F963}';
    if (rawCategory === 'Dairy') return '\u{1F95B}';
    return '\u{1F37D}'; // Default
}

function showCategoryView() {
    const grid = document.getElementById('food-category-grid');
    const list = document.getElementById('food-library-list');
    const backBtn = document.getElementById('back-to-categories-btn');
    const searchInput = document.getElementById('food-search-input');
    
    if (!grid || !list) return;
    
    if (searchInput) searchInput.value = '';
    list.innerHTML = '';
    list.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';
    grid.style.display = 'grid';
    
    grid.innerHTML = '';
    UI_CATEGORIES.forEach(uiCat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.onclick = () => filterFoodLibrary(uiCat.id);
        card.innerHTML = `
            <div class="category-emoji">${uiCat.icon}</div>
            <div class="category-name">${uiCat.id}</div>
        `;
        grid.appendChild(card);
    });
}

function renderFoodItems(items) {
    const list = document.getElementById('food-library-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedItems.forEach(food => {
        const card = document.createElement('div');
        card.className = 'food-card';
        card.innerHTML = `
            <div class="food-image-area"><span class="food-emoji">${getCategoryEmoji(food.category)}</span></div>
            <div class="food-info-area">
                <h3 class="food-name">${food.name}</h3>
                <p class="food-method">${food.description || ''}</p>
                <div class="food-nutrition" style="margin-top: 4px; display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                    <div style="display: flex; gap: 8px;">
                        <span class="nutrition-badge">Per 100g</span>
                        <span class="calorie-text">${food.caloriesPer100g} kcal</span>
                    </div>
                    <div style="font-size: 0.85rem; color: #555;">
                        <strong>Suggested Serving:</strong> ${food.servingSize}
                    </div>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function renderFoodLibrary(filterCategory) {
    if (filterCategory === 'All') {
        showCategoryView();
        return;
    }
    
    const grid = document.getElementById('food-category-grid');
    const list = document.getElementById('food-library-list');
    const backBtn = document.getElementById('back-to-categories-btn');
    
    if (grid) grid.style.display = 'none';
    if (backBtn) backBtn.style.display = 'inline-block';
    if (list) list.style.display = 'flex';
    
    const uiCategoryDef = UI_CATEGORIES.find(c => c.id === filterCategory);
    let filtered = [];
    
    if (uiCategoryDef) {
        filtered = foodDatabase.filter(f => uiCategoryDef.rawCategories.includes(f.category));
    } else {
        filtered = foodDatabase.filter(f => f.category === filterCategory);
    }
    
    renderFoodItems(filtered);
}

function filterFoodLibrary(category) {
    renderFoodLibrary(category);
}

function searchFoodLibrary() {
    const query = document.getElementById('food-search-input').value.toLowerCase().trim();
    const grid = document.getElementById('food-category-grid');
    const list = document.getElementById('food-library-list');
    const backBtn = document.getElementById('back-to-categories-btn');
    
    if (!query) {
        showCategoryView();
        return;
    }
    
    if (grid) grid.style.display = 'none';
    if (backBtn) backBtn.style.display = 'inline-block';
    if (list) list.style.display = 'flex';
    
    const filtered = foodDatabase.filter(f => {
        const nameMatch = f.name.toLowerCase().includes(query);
        const catMatch = f.category.toLowerCase().includes(query);
        
        let uiCatMatch = false;
        UI_CATEGORIES.forEach(uiCat => {
            if (uiCat.id.toLowerCase().includes(query) && uiCat.rawCategories.includes(f.category)) {
                uiCatMatch = true;
            }
        });
        
        return nameMatch || catMatch || uiCatMatch;
    });
    
    renderFoodItems(filtered);
}



