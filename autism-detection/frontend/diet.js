/* 
   NeuroCare AI Diet Recommendation System 
   Logic for generating personalized diet plans for ASD
*/

document.addEventListener('DOMContentLoaded', () => {
    const dietForm = document.getElementById('dietForm');
    const resultsPanel = document.getElementById('resultsPanel');

    // Central Data Repository for Foods & Benefits
    const foodDatabase = {
        fruits: [
            { name: "Apple", type: "Any", benefit: "Rich in antioxidants for brain protection", nutrients: ["Vitamin C", "Fiber"], restrictions: [] },
            { name: "Banana", type: "Any", benefit: "High in B6 to support serotonin production", nutrients: ["Vitamin B6", "Potassium"], restrictions: [] },
            { name: "Blueberries", type: "Any", benefit: "Powerful antioxidants shown to improve cognitive function", nutrients: ["Antioxidants", "Vitamin K"], restrictions: [] },
            { name: "Orange", type: "Any", benefit: "Supports overall immunity and brain health", nutrients: ["Vitamin C", "Folate"], restrictions: [] },
            { name: "Papaya", type: "Any", benefit: "Enzymes support healthy digestion and gut", nutrients: ["Papain", "Vitamin C"], restrictions: [] },
            { name: "Avocado", type: "Any", benefit: "Healthy monounsaturated fats for brain tissue", nutrients: ["Healthy Fats", "Vitamin E"], restrictions: [] }
        ],
        vegetables: [
            { name: "Spinach", type: "Any", benefit: "Folate for neurotransmitter function", nutrients: ["Folate", "Iron"], restrictions: [] },
            { name: "Broccoli", type: "Any", benefit: "Deep nutrition and antioxidants", nutrients: ["Vitamin K", "Fiber"], restrictions: [] },
            { name: "Carrot", type: "Any", benefit: "Beta carotene for vision and brain development", nutrients: ["Vitamin A", "Fiber"], restrictions: [] },
            { name: "Sweet Potato", type: "Any", benefit: "Complex carbs for stable blood sugar and energy", nutrients: ["Vitamin B6", "Complex Carbs"], restrictions: [] }
        ],
        proteins: [
            { name: "Eggs", type: "nonveg", benefit: "Choline supports memory and mood regulation", nutrients: ["Choline", "Protein"], restrictions: ["vegan"] },
            { name: "Fish (Salmon, Mackerel)", type: "nonveg", benefit: "Omega-3s reduce inflammation and support brain structure", nutrients: ["Omega-3", "DHA"], restrictions: ["vegan", "veg"] },
            { name: "Chicken", type: "nonveg", benefit: "Lean protein for muscle and enzyme synthesis", nutrients: ["Protein", "B Vitamins"], restrictions: ["vegan", "veg"] },
            { name: "Lentils", type: "veg", benefit: "Plant-based protein with high fiber for gut health", nutrients: ["Protein", "Fiber"], restrictions: [] },
            { name: "Tofu", type: "vegan", benefit: "Alternative complete protein source", nutrients: ["Protein", "Calcium"], restrictions: [] },
            { name: "Chickpeas", type: "veg", benefit: "High fiber and folate", nutrients: ["Fiber", "Protein"], restrictions: [] }
        ],
        fats: [
            { name: "Flax Seeds", type: "Any", benefit: "Plant-based Omega-3s essential for cognitive health", nutrients: ["Omega-3", "Fiber"], restrictions: [] },
            { name: "Walnuts", type: "Any", benefit: "Brain-shaped nuts actually boost brain function", nutrients: ["DHA", "Antioxidants"], restrictions: ["nuts"] },
            { name: "Olive Oil", type: "Any", benefit: "Healthy fats to reduce neuro-inflammation", nutrients: ["Monounsaturated Fats"], restrictions: [] },
            { name: "Chia Seeds", type: "Any", benefit: "Sustained energy and gut mobility", nutrients: ["Fiber", "Omega-3"], restrictions: [] }
        ],
        probiotics: [
            { name: "Yogurt", type: "veg", benefit: "Live cultures for a healthy gut microbiome", nutrients: ["Probiotics", "Calcium"], restrictions: ["vegan", "casein"] },
            { name: "Idli / Dosa Batter", type: "Any", benefit: "Naturally fermented for gut health and easy digestion", nutrients: ["Probiotics", "Carbs"], restrictions: [] },
            { name: "Kombucha", type: "Any", benefit: "Fermented tea supporting digestion", nutrients: ["Probiotics"], restrictions: ["child"] },
            { name: "Kimchi / Sauerkraut", type: "Any", benefit: "Fermented cabbage to rebuild gut flora", nutrients: ["Probiotics", "Vitamin K2"], restrictions: [] }
        ],
        avoid: [
            { id: "gluten", name: "Gluten (Wheat, Barley, Rye)", reason: "Often triggers sensitivity, inflammation, or brain fog in individuals with ASD." },
            { id: "casein", name: "Casein (Dairy Milk, Cheese)", reason: "A milk protein that can sometimes mimic opiate-like effects internally, impacting behavior." },
            { id: "additives", name: "Artificial Food Coloring & Preservatives", reason: "Can exacerbate hyperactivity and impulsive externalizing behaviors." },
            { id: "sugar", name: "Refined Sugars", reason: "Causes rapid spikes and crashes in blood sugar, leading to mood swings." },
            { id: "nuts", name: "Certain Tree Nuts", reason: "Allergen specific restriction." }
        ]
    };

    dietForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Gather Inputs
        const ageGroup = document.getElementById('ageGroup').value;
        const preference = document.getElementById('preference').value;
        const restrictionsInputs = document.querySelectorAll('input[type="checkbox"]:checked');
        const restrictions = Array.from(restrictionsInputs).map(cb => cb.value);

        if(preference === 'vegan') {
            restrictions.push('vegan', 'casein');
        } else if (preference === 'veg') {
            restrictions.push('veg');
        }

        // Processing Data
        generateDietPlan(ageGroup, preference, restrictions);
    });

    function generateDietPlan(ageGroup, preference, restrictions) {
        // Filter elements based on age and restrictions
        const filterFood = (foodArr) => foodArr.filter(food => {
            const hasRestriction = food.restrictions.some(r => restrictions.includes(r) || (r === 'child' && ageGroup === 'child'));
            return !hasRestriction;
        });

        const safeFruits = filterFood(foodDatabase.fruits);
        const safeVeggies = filterFood(foodDatabase.vegetables);
        const safeProteins = filterFood(foodDatabase.proteins);
        const safeFats = filterFood(foodDatabase.fats);
        const safeProbiotics = filterFood(foodDatabase.probiotics);

        const avoidList = foodDatabase.avoid.filter(item => restrictions.includes(item.id));

        renderResults(safeFruits, safeVeggies, safeProteins, safeFats, safeProbiotics, avoidList, ageGroup);
    }

    function getRandom(arr, count) {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, arr.length)).map(item => item.name);
    }

    function renderResults(fruits, veggies, proteins, fats, probiotics, avoidList, ageGroup) {
        resultsPanel.classList.remove('hidden');
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const isChild = ageGroup === 'child';
        const portions = isChild ? "Small, kid-friendly portions" : "Standard adult portions";

        // HTML building
        let html = `
            <div class="results-header glass-card">
                <h2><i class="fa-solid fa-clipboard-check"></i> Your AI Personalized Diet Plan</h2>
                <div class="badges">
                    <span class="badge info"><i class="fa-solid fa-user"></i> ${ageGroup.toUpperCase()}</span>
                    <span class="badge success"><i class="fa-solid fa-apple-whole"></i> GASTRO-FRIENDLY</span>
                    <span class="badge warning"><i class="fa-solid fa-brain"></i> BRAIN BOOSTING</span>
                </div>
            </div>

            <!-- Meal Plan Section -->
            <div class="meal-plan-section mt-4">
                <h3 class="section-title"><i class="fa-solid fa-calendar-day"></i> AI Daily Meal Planner</h3>
                <p class="text-sm text-gray mb-3"><i class="fa-solid fa-info-circle"></i> ${portions}. Consistency is key for regulating digestion and mood.</p>
                <div class="meal-grid">
                    <div class="meal-card glass-panel">
                        <div class="meal-icon"><i class="fa-solid fa-sun mb-2"></i></div>
                        <h4>Breakfast</h4>
                        <p>${getRandom(probiotics, 1).join()} with fresh ${getRandom(fruits, 1).join()} and a sprinkle of ${getRandom(fats, 1).join()}.</p>
                    </div>
                    <div class="meal-card glass-panel">
                        <div class="meal-icon"><i class="fa-solid fa-bowl-food mb-2"></i></div>
                        <h4>Lunch</h4>
                        <p>${getRandom(proteins, 1).join()} paired with roasted ${getRandom(veggies, 2).join(' & ')} cooked in ${getRandom(fats, 1).join()}.</p>
                    </div>
                    <div class="meal-card glass-panel">
                        <div class="meal-icon"><i class="fa-solid fa-apple-whole mb-2"></i></div>
                        <h4>Snacks</h4>
                        <p>A serving of ${getRandom(fruits, 1).join()} or healthy ${getRandom(fats, 1).join()}.</p>
                    </div>
                    <div class="meal-card glass-panel">
                        <div class="meal-icon"><i class="fa-solid fa-moon mb-2"></i></div>
                        <h4>Dinner</h4>
                        <p>Easily digestible ${getRandom(veggies, 1).join()} soup with a side of ${getRandom(proteins, 1).join()} to support overnight rest.</p>
                    </div>
                </div>
            </div>

            <div class="lists-container mt-4">
                <!-- Recommended Foods -->
                <div class="recommended-list glass-card border-left-success">
                    <h3 class="section-title text-success"><i class="fa-solid fa-circle-check"></i> Core Recommended Foods</h3>
                    
                    <div class="food-category">
                        <h4>🧠 Brain-Boosting Proteins & Fats</h4>
                        <ul>
                            ${proteins.slice(0,3).map(p => `<li><strong>${p.name}:</strong> <span class="text-sm">${p.benefit}</span></li>`).join('')}
                            ${fats.slice(0,2).map(f => `<li><strong>${f.name}:</strong> <span class="text-sm">${f.benefit}</span></li>`).join('')}
                        </ul>
                    </div>

                    <div class="food-category mt-3">
                        <h4>🦠 Gut-Friendly Probiotics</h4>
                        <ul>
                            ${probiotics.map(p => `<li><strong>${p.name}:</strong> <span class="text-sm">${p.benefit}</span></li>`).join('')}
                        </ul>
                    </div>

                    <div class="food-category mt-3">
                        <h4>🫐 Antioxidant Fruits & Veggies</h4>
                        <ul>
                            ${fruits.slice(0,3).map(f => `<li><strong>${f.name}:</strong> <span class="text-sm">${f.benefit}</span></li>`).join('')}
                            ${veggies.slice(0,2).map(v => `<li><strong>${v.name}:</strong> <span class="text-sm">${v.benefit}</span></li>`).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Avoid List -->
                ${avoidList.length > 0 ? `
                <div class="avoid-list glass-card border-left-danger mt-4">
                    <h3 class="section-title text-danger"><i class="fa-solid fa-circle-xmark"></i> Foods to Avoid/Limit</h3>
                    <p class="text-sm mb-3">Based on your selected sensitivities, carefully restrict the following to prevent distress, inflammation, and behavioral triggers:</p>
                    <ul>
                        ${avoidList.map(a => `
                            <li>
                                <strong>${a.name}</strong>
                                <p class="text-sm reason-text">${a.reason}</p>
                            </li>
                        `).join('')}
                    </ul>
                </div>` : ''}
            </div>

            <!-- Tracker -->
            <div class="weekly-tracker glass-card mt-4">
                <h3><i class="fa-solid fa-chart-line"></i> Neuro-Nutrient Tracking Goal</h3>
                <p class="text-sm">Aim to hit these markers daily to ensure optimal behavioral health:</p>
                <div class="progress-bar-container mt-2">
                    <label>Omega-3 / DHA Levels</label>
                    <div class="progress-bg"><div class="progress-fill" style="width: 80%; background: var(--accent-magenta)"></div></div>
                </div>
                <div class="progress-bar-container">
                    <label>Antioxidants & Vitamins (Veggies)</label>
                    <div class="progress-bg"><div class="progress-fill" style="width: 65%; background: var(--accent-cyan)"></div></div>
                </div>
                <div class="progress-bar-container">
                    <label>Probiotics & Prebiotics (Gut Health)</label>
                    <div class="progress-bg"><div class="progress-fill" style="width: 100%; background: var(--accent-indigo)"></div></div>
                </div>
            </div>
        `;

        resultsPanel.innerHTML = html;
        
        // Small fade-in animation trigger
        setTimeout(() => resultsPanel.classList.add('visible'), 10);
    }
});
