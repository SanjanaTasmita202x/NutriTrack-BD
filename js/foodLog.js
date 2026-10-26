let dailyFoodLog = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
};

let currentLogDate = getLocalDateString();
let activeLoadedFoodSessionId = '__uninitialized__';
let isFoodSaving = false;
let activeFoodLoadPromise = null;
let activeLoadTargetSessionId = null;
let currentFoodLoadRequestId = 0;

const FOOD_DAILY_STORAGE_KEY = 'nutritrack_daily_log';
const FOOD_HISTORY_STORAGE_KEY = 'nutritrack_food_history';

/**
 * Returns the local calendar date string formatted as YYYY-MM-DD
 * @param {Date} [dateObj]
 * @returns {string}
 */
function getLocalDateString(dateObj = new Date()) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Retrieves the currently active user email from session if logged in
 * @returns {string|null}
 */
function getActiveUserEmail() {
    if (typeof getAuthSession === 'function') {
        const session = getAuthSession();
        if (session && session.email) {
            return session.email.trim().toLowerCase();
        }
    }
    return null;
}

// --- History & Daily Food Log State ---

/**
 * Loads today's food log entries from Supabase (authenticated) or localStorage (guest).
 * Ensures full account isolation: authenticated users load only rows where user_id = session.id.
 * Session-aware concurrency protected: overlapping/repeated load calls for the same session return the active in-flight Promise.
 * Transitions between guest and authenticated sessions trigger immediate distinct loads, with request sequence tracking.
 * @param {object|null} [explicitSession=null] - Optional Supabase session
 * @returns {Promise<void>}
 */
async function loadFoodLog(explicitSession = null) {
    let targetSession = explicitSession;
    if (!targetSession && typeof getAuthSession === 'function') {
        targetSession = getAuthSession();
    }

    // Direct fallback to Supabase client session if getAuthSession() hasn't populated yet
    if (!targetSession && typeof window !== 'undefined' && window.supabaseClient && window.supabaseClient.auth) {
        try {
            const { data } = await window.supabaseClient.auth.getSession();
            if (data && data.session && data.session.user) {
                targetSession = {
                    id: data.session.user.id,
                    email: data.session.user.email || '',
                    user: data.session.user
                };
                if (typeof currentAuthSession !== 'undefined') currentAuthSession = data.session;
                if (typeof currentAuthUser !== 'undefined') currentAuthUser = data.session.user;
                if (typeof updateAuthMenuUI === 'function') updateAuthMenuUI();
            }
        } catch (e) {
            console.warn('loadFoodLog: error inspecting Supabase session directly:', e);
        }
    }

    const targetSessionId = targetSession ? (targetSession.user?.id || targetSession.id || 'auth') : 'guest';

    // If an in-flight load is targeting the exact same session ID, reuse it
    if (activeFoodLoadPromise && activeLoadTargetSessionId === targetSessionId) {
        return activeFoodLoadPromise;
    }

    const requestId = ++currentFoodLoadRequestId;
    activeLoadTargetSessionId = targetSessionId;

    const currentPromise = (async () => {
        try {
            await _performLoadFoodLog(targetSession, requestId);
        } finally {
            if (activeFoodLoadPromise === currentPromise) {
                activeFoodLoadPromise = null;
                activeLoadTargetSessionId = null;
            }
        }
    })();

    activeFoodLoadPromise = currentPromise;
    return currentPromise;
}

/**
 * Core implementation of food log loading.
 * Atomically replaces in-memory dailyFoodLog to prevent duplicate rows from overlapping calls.
 * Request-sequenced to discard stale responses if another load was initiated.
 * @param {object|null} [sessionParam=null]
 * @param {number|null} [requestId=null]
 */
async function _performLoadFoodLog(sessionParam = null, requestId = null) {
    const todayStr = getLocalDateString();
    currentLogDate = todayStr;

    let session = sessionParam;
    if (!session && typeof getAuthSession === 'function') {
        session = getAuthSession();
    }

    // Safety fallback to Supabase client session
    if (!session && typeof window !== 'undefined' && window.supabaseClient && window.supabaseClient.auth) {
        try {
            const { data } = await window.supabaseClient.auth.getSession();
            if (data && data.session && data.session.user) {
                session = {
                    id: data.session.user.id,
                    email: data.session.user.email || '',
                    user: data.session.user
                };
                if (typeof currentAuthSession !== 'undefined') currentAuthSession = data.session;
                if (typeof currentAuthUser !== 'undefined') currentAuthUser = data.session.user;
                if (typeof updateAuthMenuUI === 'function') updateAuthMenuUI();
            }
        } catch (e) {
            console.warn('Exception inspecting session in _performLoadFoodLog:', e);
        }
    }

    const userId = session?.user?.id || session?.id || null;

    if (userId) {
        // 1. Authenticated User: Load from Supabase public.food_logs for today
        activeLoadedFoodSessionId = userId;
        const client = window.supabaseClient;
        if (!client) {
            console.warn('Supabase client unavailable while loading food log.');
            if (requestId && requestId !== currentFoodLoadRequestId) return;
            dailyFoodLog = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            };
            renderFoodLog();
            if (typeof renderFoodHistory === 'function') renderFoodHistory();
            return;
        }

        try {
            const { data, error } = await client
                .from('food_logs')
                .select('id, user_id, log_date, meal_type, food_id, food_name, grams, calories, created_at')
                .eq('user_id', userId)
                .eq('log_date', todayStr)
                .order('created_at', { ascending: true });

            // Discard stale load if newer request started
            if (requestId && requestId !== currentFoodLoadRequestId) {
                return;
            }

            if (error) {
                console.error('Error loading today food log from Supabase:', error);
                // On error, clear state to avoid displaying stale data
                dailyFoodLog = {
                    breakfast: [],
                    lunch: [],
                    dinner: [],
                    snacks: []
                };
            } else {
                // Build a fresh isolated container so state is atomically replaced (never appended)
                const freshDailyLog = {
                    breakfast: [],
                    lunch: [],
                    dinner: [],
                    snacks: []
                };

                if (data && Array.isArray(data)) {
                    // Track seen database row UUIDs to ensure each row in public.food_logs is represented exactly once
                    const seenRowIds = new Set();
                    data.forEach(item => {
                        const rowId = String(item.id);
                        if (seenRowIds.has(rowId)) return;
                        seenRowIds.add(rowId);

                        const m = item.meal_type;
                        if (freshDailyLog[m]) {
                            freshDailyLog[m].push({
                                id: rowId,
                                foodId: item.food_id,
                                name: item.food_name,
                                grams: parseFloat(item.grams),
                                calories: parseInt(item.calories, 10),
                                mealType: m,
                                date: String(item.log_date).split('T')[0],
                                user_id: item.user_id,
                                created_at: item.created_at
                            });
                        }
                    });
                }

                // Atomically replace previous in-memory state
                dailyFoodLog = freshDailyLog;
            }
        } catch (err) {
            if (requestId && requestId !== currentFoodLoadRequestId) return;
            console.error('Unexpected exception loading today food log:', err);
            dailyFoodLog = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            };
        }
    } else {
        // 2. Guest User: Load from localStorage
        if (requestId && requestId !== currentFoodLoadRequestId) return;
        activeLoadedFoodSessionId = null;
        let history = {};
        try {
            const rawHistory = localStorage.getItem(FOOD_HISTORY_STORAGE_KEY);
            if (rawHistory) {
                history = JSON.parse(rawHistory);
            }
        } catch (e) {
            console.warn('Error parsing saved food history', e);
        }

        if (!history || typeof history !== 'object' || Array.isArray(history)) {
            history = {};
        }

        // Backward compatibility: check if legacy daily log exists without history
        try {
            const legacyRaw = localStorage.getItem(FOOD_DAILY_STORAGE_KEY);
            if (legacyRaw && Object.keys(history).length === 0) {
                const legacyParsed = JSON.parse(legacyRaw);
                if (legacyParsed && (
                    (legacyParsed.breakfast && legacyParsed.breakfast.length > 0) ||
                    (legacyParsed.lunch && legacyParsed.lunch.length > 0) ||
                    (legacyParsed.dinner && legacyParsed.dinner.length > 0) ||
                    (legacyParsed.snacks && legacyParsed.snacks.length > 0)
                )) {
                    history[todayStr] = {
                        date: todayStr,
                        breakfast: (legacyParsed.breakfast || []).map(item => ({ ...item, date: todayStr, mealType: 'breakfast' })),
                        lunch: (legacyParsed.lunch || []).map(item => ({ ...item, date: todayStr, mealType: 'lunch' })),
                        dinner: (legacyParsed.dinner || []).map(item => ({ ...item, date: todayStr, mealType: 'dinner' })),
                        snacks: (legacyParsed.snacks || []).map(item => ({ ...item, date: todayStr, mealType: 'snacks' }))
                    };
                    localStorage.setItem(FOOD_HISTORY_STORAGE_KEY, JSON.stringify(history));
                }
            }
        } catch (e) {
            console.warn('Error migrating legacy food log:', e);
        }

        const freshGuestLog = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };

        // Load today's entries if they exist in history
        if (history[todayStr]) {
            const todayData = history[todayStr];
            freshGuestLog.breakfast = Array.isArray(todayData.breakfast) ? todayData.breakfast : [];
            freshGuestLog.lunch = Array.isArray(todayData.lunch) ? todayData.lunch : [];
            freshGuestLog.dinner = Array.isArray(todayData.dinner) ? todayData.dinner : [];
            freshGuestLog.snacks = Array.isArray(todayData.snacks) ? todayData.snacks : [];
        }

        dailyFoodLog = freshGuestLog;

        // Keep legacy/daily key updated for today in guest mode
        try {
            localStorage.setItem(FOOD_DAILY_STORAGE_KEY, JSON.stringify(dailyFoodLog));
        } catch (e) {
            console.warn('Error saving daily log sync:', e);
        }
    }

    if (requestId && requestId !== currentFoodLoadRequestId) {
        return;
    }

    renderFoodLog();
    if (typeof renderFoodHistory === 'function') {
        await renderFoodHistory();
    }
}

/**
 * Persists guest food records into localStorage.
 * Authenticated records are never saved to localStorage to prevent data leakage.
 */
function saveFoodLog() {
    let session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    const userId = session?.user?.id || session?.id || null;
    if (userId || (activeLoadedFoodSessionId && activeLoadedFoodSessionId !== '__uninitialized__')) {
        return; // Authenticated entries persist to Supabase only
    }

    const todayStr = currentLogDate || getLocalDateString();

    // 1. Save today's log to daily key
    try {
        localStorage.setItem(FOOD_DAILY_STORAGE_KEY, JSON.stringify(dailyFoodLog));
    } catch (e) {
        console.error('Error saving daily food log', e);
    }

    // 2. Persist to food history map
    try {
        const rawHistory = localStorage.getItem(FOOD_HISTORY_STORAGE_KEY);
        let history = rawHistory ? JSON.parse(rawHistory) : {};
        if (!history || typeof history !== 'object' || Array.isArray(history)) {
            history = {};
        }

        history[todayStr] = {
            date: todayStr,
            breakfast: dailyFoodLog.breakfast || [],
            lunch: dailyFoodLog.lunch || [],
            dinner: dailyFoodLog.dinner || [],
            snacks: dailyFoodLog.snacks || []
        };

        localStorage.setItem(FOOD_HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Error saving food history', e);
    }
}

// --- Food Selector UI Logic ---
function populateFoodSelector() {
    // Kept as empty to prevent errors if called by app.js initialization
}

function handleFoodSearch() {
    const searchInput = document.getElementById('food-log-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const suggestionsContainer = document.getElementById('food-suggestions');
    const selectedIdInput = document.getElementById('selected-food-id');

    // If user changes text, invalidate any previously selected ID
    if (selectedIdInput) selectedIdInput.value = '';

    if (!query) {
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
            suggestionsContainer.innerHTML = '';
        }
        return;
    }

    const matches = foodDatabase.filter(food => {
        const nameLower = (food.name || '').toLowerCase();
        const descLower = (food.description || '').toLowerCase();
        if (nameLower.includes(query) || descLower.includes(query)) {
            return true;
        }
        // Explicit alias support for Polao / Pulao
        if ((query === 'pulao' || query === 'polao') && (food.id === 'f53' || nameLower.includes('polao') || nameLower.includes('pulao'))) {
            return true;
        }
        return false;
    }).slice(0, 10);

    if (!suggestionsContainer) return;

    if (matches.length === 0) {
        suggestionsContainer.style.display = 'none';
        suggestionsContainer.innerHTML = '';
        return;
    }

    suggestionsContainer.innerHTML = '';
    matches.forEach(food => {
        const item = document.createElement('div');
        item.className = 'food-suggestion-item';
        item.textContent = `${food.name} (${food.caloriesPer100g} kcal/100g)`;
        item.onclick = () => selectFoodSuggestion(food.id, food.name);
        suggestionsContainer.appendChild(item);
    });

    suggestionsContainer.style.display = 'block';
}

function selectFoodSuggestion(foodId, foodName) {
    document.getElementById('food-log-search-input').value = foodName;
    document.getElementById('selected-food-id').value = foodId;
    
    const suggestionsContainer = document.getElementById('food-suggestions');
    suggestionsContainer.style.display = 'none';
    suggestionsContainer.innerHTML = '';
}

function openFoodSelector(mealType) {
    document.getElementById('current-meal-type').value = mealType;
    
    const searchInput = document.getElementById('food-log-search-input');
    if (searchInput) searchInput.value = '';
    
    const selectedIdInput = document.getElementById('selected-food-id');
    if (selectedIdInput) selectedIdInput.value = '';
    
    const suggestionsContainer = document.getElementById('food-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
        suggestionsContainer.innerHTML = '';
    }
    
    const gramsInput = document.getElementById('food-grams-input');
    if (gramsInput) gramsInput.value = '';
    
    const titleMap = {
        'breakfast': 'Breakfast',
        'lunch': 'Lunch',
        'dinner': 'Dinner',
        'snacks': 'Snacks'
    };
    document.getElementById('food-selector-title').textContent = `Add to ${titleMap[mealType]}`;
    
    document.getElementById('food-selector-overlay').style.display = 'flex';
}

function closeFoodSelector() {
    document.getElementById('food-selector-overlay').style.display = 'none';
}

// --- Core Food Log Logic ---

/**
 * Adds a food entry to the daily log.
 * Authenticated entries persist to Supabase; guest entries persist to localStorage.
 */
async function addFoodEntry() {
    const mealType = document.getElementById('current-meal-type').value;
    let foodId = document.getElementById('selected-food-id').value;
    const searchInput = document.getElementById('food-log-search-input');
    const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // Direct resolution if food was typed but not clicked in suggestions
    if (!foodId && searchVal) {
        const directMatch = foodDatabase.find(f => {
            const nameLower = (f.name || '').toLowerCase();
            if (nameLower === searchVal || nameLower.startsWith(searchVal + ' ') || nameLower.includes(`(${searchVal})`)) return true;
            if ((searchVal === 'polao' || searchVal === 'pulao' || searchVal === 'পোলাও') && (f.id === 'f53' || nameLower.includes('polao') || nameLower.includes('pulao'))) return true;
            return false;
        });
        if (directMatch) {
            foodId = directMatch.id;
            document.getElementById('selected-food-id').value = foodId;
            document.getElementById('food-log-search-input').value = directMatch.name;
        }
    }

    const gramsInput = document.getElementById('food-grams-input').value;
    const grams = parseFloat(gramsInput);
    
    if (!foodId) {
        alert('Please select a food.');
        return;
    }
    
    if (isNaN(grams) || grams <= 0) {
        alert('Please enter a valid amount in grams.');
        return;
    }
    
    const food = foodDatabase.find(f => f.id === foodId);
    if (!food) return;
    
    const calculatedCalories = Math.round((food.caloriesPer100g * grams) / 100);
    
    const todayStr = getLocalDateString();
    if (currentLogDate !== todayStr) {
        currentLogDate = todayStr;
        await loadFoodLog();
    }

    // Prevent duplicate rapid submissions
    if (isFoodSaving) return;
    isFoodSaving = true;

    // Direct session resolution with Supabase fallback
    let session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    if (!session && window.supabaseClient && window.supabaseClient.auth) {
        try {
            const { data } = await window.supabaseClient.auth.getSession();
            if (data && data.session && data.session.user) {
                session = {
                    id: data.session.user.id,
                    email: data.session.user.email || '',
                    user: data.session.user
                };
                if (typeof currentAuthSession !== 'undefined') currentAuthSession = data.session;
                if (typeof currentAuthUser !== 'undefined') currentAuthUser = data.session.user;
                if (typeof updateAuthMenuUI === 'function') updateAuthMenuUI();
            }
        } catch (e) {
            console.warn('addFoodEntry: session check error:', e);
        }
    }

    const userId = session?.user?.id || session?.id || null;

    // Safety guard against silent routing to guest storage:
    // If the active food log was loaded for an authenticated user, but no session is currently verified,
    // do NOT save to guest localStorage. Alert the user to re-authenticate.
    if (!userId && activeLoadedFoodSessionId && activeLoadedFoodSessionId !== '__uninitialized__') {
        isFoodSaving = false;
        alert('Authentication session expired or unavailable. Please sign in again to save your food log.');
        return;
    }

    try {
        if (userId) {
            // --- Authenticated User: Supabase public.food_logs ---
            const client = window.supabaseClient;
            if (!client) {
                throw new Error('Database service is currently unavailable. Please reload the page.');
            }

            const { data: newRow, error: insertErr } = await client
                .from('food_logs')
                .insert({
                    user_id: userId,
                    log_date: todayStr,
                    meal_type: mealType,
                    food_id: food.id,
                    food_name: food.name,
                    grams: grams,
                    calories: calculatedCalories
                })
                .select('id, user_id, log_date, meal_type, food_id, food_name, grams, calories, created_at')
                .single();

            if (insertErr) {
                throw insertErr;
            }

            if (newRow) {
                if (!dailyFoodLog[mealType]) {
                    dailyFoodLog[mealType] = [];
                }
                const newRowId = String(newRow.id);
                const existingIdx = dailyFoodLog[mealType].findIndex(e => String(e.id) === newRowId);
                const entryObj = {
                    id: newRowId,
                    foodId: newRow.food_id,
                    name: newRow.food_name,
                    grams: parseFloat(newRow.grams),
                    calories: parseInt(newRow.calories, 10),
                    mealType: newRow.meal_type,
                    date: String(newRow.log_date).split('T')[0],
                    user_id: newRow.user_id,
                    created_at: newRow.created_at
                };
                if (existingIdx >= 0) {
                    dailyFoodLog[mealType][existingIdx] = entryObj;
                } else {
                    dailyFoodLog[mealType].push(entryObj);
                }
            } else {
                await loadFoodLog(session);
            }
        } else {
            // --- Guest User: localStorage ---
            const newEntry = {
                id: 'food_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7),
                foodId: food.id,
                name: food.name,
                grams: grams,
                calories: calculatedCalories,
                mealType: mealType,
                date: todayStr
            };

            if (!dailyFoodLog[mealType]) {
                dailyFoodLog[mealType] = [];
            }
            dailyFoodLog[mealType].push(newEntry);
            saveFoodLog();
        }

        renderFoodLog();
        if (typeof renderFoodHistory === 'function') {
            await renderFoodHistory();
        }
        closeFoodSelector();
    } catch (err) {
        console.error('Error adding food entry:', err);
        alert('Failed to save food entry: ' + (err.message || 'Please check your connection and try again.'));
    } finally {
        isFoodSaving = false;
    }
}

/**
 * Removes an individual food entry from today's log.
 * Authenticated entries are deleted from Supabase; guest entries from localStorage.
 * @param {string} mealType
 * @param {string} entryId
 */
async function removeFoodEntry(mealType, entryId) {
    let session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    if (!session && window.supabaseClient && window.supabaseClient.auth) {
        try {
            const { data } = await window.supabaseClient.auth.getSession();
            if (data && data.session && data.session.user) {
                session = {
                    id: data.session.user.id,
                    email: data.session.user.email || '',
                    user: data.session.user
                };
            }
        } catch (e) {
            // ignore
        }
    }

    const userId = session?.user?.id || session?.id || null;

    if (userId) {
        // --- Authenticated User: Delete from Supabase public.food_logs ---
        const client = window.supabaseClient;
        if (!client) {
            alert('Database service unavailable. Please reload the page.');
            return;
        }

        try {
            const { error } = await client
                .from('food_logs')
                .delete()
                .eq('id', entryId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error removing food entry from Supabase:', error);
                alert('Failed to remove item: ' + (error.message || 'Please check your connection.'));
                return;
            }

            // Remove from in-memory dailyFoodLog after confirmed DB deletion
            if (dailyFoodLog[mealType]) {
                dailyFoodLog[mealType] = dailyFoodLog[mealType].filter(entry => String(entry.id) !== String(entryId));
            }
        } catch (err) {
            console.error('Unexpected error removing food entry:', err);
            alert('Unexpected error removing item. Please try again.');
            return;
        }
    } else {
        // --- Guest User: Remove from localStorage ---
        if (dailyFoodLog[mealType]) {
            dailyFoodLog[mealType] = dailyFoodLog[mealType].filter(entry => String(entry.id) !== String(entryId));
        }
        saveFoodLog();
    }

    renderFoodLog();
    if (typeof renderFoodHistory === 'function') {
        await renderFoodHistory();
    }
}

function renderFoodLog() {
    // If the active auth session has changed since the last load, trigger a fresh load
    const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    const currentSessionId = (session && (session.user?.id || session.id)) ? (session.user?.id || session.id) : null;
    if (activeLoadedFoodSessionId !== '__uninitialized__' && currentSessionId !== activeLoadedFoodSessionId) {
        loadFoodLog(session);
        return;
    }

    // Automatically rollover if calendar date changed
    const todayStr = getLocalDateString();
    if (currentLogDate !== todayStr) {
        loadFoodLog(session);
        return;
    }

    const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
    let dailyTotal = 0;
    
    meals.forEach(meal => {
        const listContainer = document.getElementById(`${meal}-list`);
        const totalSpan = document.getElementById(`${meal}-total`);
        
        if (!listContainer || !totalSpan) return;
        
        listContainer.innerHTML = '';
        let mealTotal = 0;
        
        const items = dailyFoodLog[meal] || [];
        items.forEach(entry => {
            mealTotal += entry.calories;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'food-log-item';
            itemDiv.innerHTML = `
                <div class="food-log-info">
                    <div class="food-log-name">${entry.name}</div>
                    <div class="food-log-details">${entry.grams}g</div>
                </div>
                <div class="food-log-calories">${entry.calories} kcal</div>
                <button class="remove-btn" onclick="removeFoodEntry('${meal}', '${entry.id}')" title="Remove">×</button>
            `;
            listContainer.appendChild(itemDiv);
        });
        
        totalSpan.textContent = `${mealTotal} kcal`;
        dailyTotal += mealTotal;
    });
    
    const dailyTotalEl = document.getElementById('daily-total-calories');
    if (dailyTotalEl) {
        dailyTotalEl.textContent = dailyTotal;
    }
}

/**
 * Returns formatted historical food log records sorted newest to oldest
 * @param {boolean} [includeToday=false] - When false, returns only previous days' records
 * @returns {Array<object>}
 */
function getFoodHistory(includeToday = false) {
    let history = {};
    try {
        const raw = localStorage.getItem(FOOD_HISTORY_STORAGE_KEY);
        if (raw) {
            history = JSON.parse(raw);
        }
    } catch (e) {
        console.warn('Error reading food history:', e);
    }
    
    if (!history || typeof history !== 'object' || Array.isArray(history)) {
        return [];
    }
    
    const activeEmail = getActiveUserEmail();
    const todayStr = getLocalDateString();
    
    const dayList = Object.keys(history).map(dateStr => {
        const dayData = history[dateStr] || {};
        const breakfast = Array.isArray(dayData.breakfast) ? dayData.breakfast : [];
        const lunch = Array.isArray(dayData.lunch) ? dayData.lunch : [];
        const dinner = Array.isArray(dayData.dinner) ? dayData.dinner : [];
        const snacks = Array.isArray(dayData.snacks) ? dayData.snacks : [];
        
        let totalCalories = 0;
        [...breakfast, ...lunch, ...dinner, ...snacks].forEach(item => {
            totalCalories += (item.calories || 0);
        });
        
        return {
            date: dateStr,
            user_email: dayData.user_email || null,
            breakfast,
            lunch,
            dinner,
            snacks,
            totalCalories,
            totalItems: breakfast.length + lunch.length + dinner.length + snacks.length
        };
    }).filter(day => {
        // Exclude completely empty day logs
        if (day.totalItems === 0) return false;
        // User identity filtering if logged in
        if (activeEmail && day.user_email && day.user_email.toLowerCase() !== activeEmail) {
            return false;
        }
        // Exclude today if viewing previous days' records inside Daily Food Log
        if (!includeToday && day.date === todayStr) {
            return false;
        }
        return true;
    });
    
    // Sort descending by date (newest first)
    dayList.sort((a, b) => new Date(b.date) - new Date(a.date));
    return dayList;
}

/**
 * Deletes all food history records for a single historical day with confirmation.
 * Authenticated records are deleted from Supabase; guest records from localStorage.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 */
async function deleteFoodHistoryDay(dateStr) {
    if (!dateStr) return;

    // Safety guard: do not delete today's active log from history
    const todayStr = getLocalDateString();
    if (dateStr === todayStr) {
        console.warn('Cannot delete active food log for today from history.');
        return;
    }

    const confirmed = window.confirm('Delete all food records for this day? This action cannot be undone.');
    if (!confirmed) {
        return;
    }

    let session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    if (!session && window.supabaseClient && window.supabaseClient.auth) {
        try {
            const { data } = await window.supabaseClient.auth.getSession();
            if (data && data.session && data.session.user) {
                session = {
                    id: data.session.user.id,
                    email: data.session.user.email || '',
                    user: data.session.user
                };
            }
        } catch (e) {
            // ignore
        }
    }

    const userId = session?.user?.id || session?.id || null;

    if (userId) {
        // --- Authenticated User: Delete from Supabase public.food_logs ---
        const client = window.supabaseClient;
        if (!client) {
            alert('Database service unavailable. Please reload the page.');
            return;
        }

        try {
            const { error } = await client
                .from('food_logs')
                .delete()
                .eq('log_date', dateStr)
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting food history day from Supabase:', error);
                alert('Failed to delete food records: ' + (error.message || 'Please check connection.'));
                return;
            }
        } catch (err) {
            console.error('Unexpected error deleting food history day:', err);
            alert('Unexpected error deleting food records. Please try again.');
            return;
        }
    } else {
        // --- Guest User: Delete from localStorage ---
        try {
            const rawHistory = localStorage.getItem(FOOD_HISTORY_STORAGE_KEY);
            if (rawHistory) {
                const history = JSON.parse(rawHistory);
                if (history && typeof history === 'object' && history[dateStr]) {
                    delete history[dateStr];
                    localStorage.setItem(FOOD_HISTORY_STORAGE_KEY, JSON.stringify(history));
                }
            }
        } catch (e) {
            console.error('Error deleting food history for day:', dateStr, e);
        }
    }

    await renderFoodHistory();
}

window.deleteFoodHistoryDay = deleteFoodHistoryDay;

/**
 * Formats YYYY-MM-DD into a readable label
 * @param {string} dateStr
 * @returns {string}
 */
function formatHistoryDate(dateStr) {
    if (!dateStr) return '';
    const todayStr = getLocalDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    
    const parts = dateStr.split('-');
    let formattedDate = dateStr;
    if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mIdx = parseInt(parts[1], 10) - 1;
        const monthName = months[mIdx] || parts[1];
        formattedDate = `${parseInt(parts[2], 10)} ${monthName} ${parts[0]}`;
    }
    
    if (dateStr === todayStr) {
        return `Today, ${formattedDate}`;
    } else if (dateStr === yesterdayStr) {
        return `Yesterday, ${formattedDate}`;
    }
    return formattedDate;
}

/**
 * Renders the food history list into Daily Food Log view (showing previous days' records).
 * Authenticated records are loaded from Supabase; guest records from localStorage.
 */
async function renderFoodHistory() {
    const listContainer = document.getElementById('food-history-list');
    const emptyState = document.getElementById('food-history-empty-state');
    
    if (!listContainer) return;

    let session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    if (!session && window.supabaseClient && window.supabaseClient.auth) {
        try {
            const { data } = await window.supabaseClient.auth.getSession();
            if (data && data.session && data.session.user) {
                session = {
                    id: data.session.user.id,
                    email: data.session.user.email || '',
                    user: data.session.user
                };
            }
        } catch (e) {
            // ignore
        }
    }

    const userId = session?.user?.id || session?.id || null;
    const todayStr = getLocalDateString();
    let historyList = [];

    if (userId) {
        // --- Authenticated User: Load from Supabase public.food_logs (previous days only) ---
        const client = window.supabaseClient;
        if (client) {
            try {
                const { data, error } = await client
                    .from('food_logs')
                    .select('id, user_id, log_date, meal_type, food_id, food_name, grams, calories, created_at')
                    .eq('user_id', userId)
                    .neq('log_date', todayStr)
                    .order('log_date', { ascending: false })
                    .order('created_at', { ascending: true });

                if (error) {
                    console.error('Error loading food history from Supabase:', error);
                } else if (data) {
                    const daysMap = {};
                    const seenHistoryRowIds = new Set();
                    data.forEach(row => {
                        const rowId = String(row.id);
                        if (seenHistoryRowIds.has(rowId)) return;
                        seenHistoryRowIds.add(rowId);

                        const d = String(row.log_date).split('T')[0];
                        if (!daysMap[d]) {
                            daysMap[d] = {
                                date: d,
                                user_id: row.user_id,
                                breakfast: [],
                                lunch: [],
                                dinner: [],
                                snacks: [],
                                totalCalories: 0,
                                totalItems: 0
                            };
                        }
                        const item = {
                            id: rowId,
                            foodId: row.food_id,
                            name: row.food_name,
                            grams: parseFloat(row.grams),
                            calories: parseInt(row.calories, 10),
                            mealType: row.meal_type,
                            date: d,
                            user_id: row.user_id
                        };
                        if (daysMap[d][row.meal_type]) {
                            daysMap[d][row.meal_type].push(item);
                        }
                        daysMap[d].totalCalories += item.calories;
                        daysMap[d].totalItems += 1;
                    });
                    historyList = Object.values(daysMap).sort((a, b) => new Date(b.date) - new Date(a.date));
                }
            } catch (err) {
                console.error('Unexpected exception loading food history from Supabase:', err);
            }
        }
    } else {
        // --- Guest User: Load from localStorage ---
        historyList = getFoodHistory(false);
    }
    
    if (!historyList || historyList.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        listContainer.style.display = 'none';
        listContainer.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'column';
    listContainer.style.gap = '12px';
    listContainer.innerHTML = '';
    
    const mealLabels = {
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        dinner: 'Dinner',
        snacks: 'Snacks'
    };
    
    historyList.forEach(day => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        itemDiv.style.backgroundColor = 'var(--card-bg, #ffffff)';
        itemDiv.style.borderRadius = 'var(--radius-md, 8px)';
        itemDiv.style.padding = '14px';
        itemDiv.style.border = '1px solid var(--border-color, #e2e8f0)';
        itemDiv.style.boxShadow = 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))';
        
        // Date Header
        const dateDiv = document.createElement('div');
        dateDiv.className = 'history-date';
        dateDiv.style.display = 'flex';
        dateDiv.style.justifyContent = 'space-between';
        dateDiv.style.alignItems = 'center';
        
        const dateTitle = document.createElement('span');
        dateTitle.textContent = formatHistoryDate(day.date);
        dateTitle.style.color = 'var(--text-main, #111111)';
        dateDiv.appendChild(dateTitle);
        
        // Delete button for this day's record
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'food-history-delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete all food records for this day';
        deleteBtn.setAttribute('aria-label', `Delete all food records for ${formatHistoryDate(day.date)}`);
        deleteBtn.style.background = 'none';
        deleteBtn.style.border = 'none';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontSize = '1.1rem';
        deleteBtn.style.opacity = '0.75';
        deleteBtn.style.padding = '4px 6px';
        deleteBtn.style.lineHeight = '1';
        deleteBtn.onmouseenter = () => { deleteBtn.style.opacity = '1'; };
        deleteBtn.onmouseleave = () => { deleteBtn.style.opacity = '0.75'; };
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteFoodHistoryDay(day.date);
        };
        dateDiv.appendChild(deleteBtn);
        
        itemDiv.appendChild(dateDiv);
        
        // Meal Details Container
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'history-details';
        detailsDiv.style.margin = '8px 0';
        
        const mealKeys = ['breakfast', 'lunch', 'dinner', 'snacks'];
        mealKeys.forEach(m => {
            const meals = day[m] || [];
            if (meals.length > 0) {
                meals.forEach(entry => {
                    const mealRow = document.createElement('div');
                    mealRow.className = 'history-meal';
                    mealRow.style.padding = '4px 0';
                    mealRow.style.display = 'flex';
                    mealRow.style.justifyContent = 'space-between';
                    mealRow.style.alignItems = 'center';
                    
                    const left = document.createElement('span');
                    left.textContent = `${mealLabels[m]}: ${entry.name} (${entry.grams}g)`;
                    left.style.fontSize = '0.9rem';
                    
                    const right = document.createElement('span');
                    right.textContent = `${entry.calories} kcal`;
                    right.style.fontWeight = '600';
                    right.style.color = 'var(--accent-color, #ff6b6b)';
                    right.style.fontSize = '0.9rem';
                    
                    mealRow.appendChild(left);
                    mealRow.appendChild(right);
                    detailsDiv.appendChild(mealRow);
                });
            }
        });
        
        itemDiv.appendChild(detailsDiv);
        
        // Daily Total Row
        const totalDiv = document.createElement('div');
        totalDiv.className = 'history-total';
        totalDiv.style.display = 'flex';
        totalDiv.style.justifyContent = 'space-between';
        totalDiv.style.alignItems = 'center';
        totalDiv.style.borderTop = '1px dashed var(--border-color, #e2e8f0)';
        totalDiv.style.paddingTop = '8px';
        totalDiv.style.marginTop = '6px';
        
        const totalLabel = document.createElement('span');
        totalLabel.style.fontWeight = '500';
        totalLabel.textContent = 'Daily Total';
        
        const totalVal = document.createElement('strong');
        totalVal.style.color = 'var(--accent-color, #ff6b6b)';
        totalVal.style.fontSize = '1rem';
        totalVal.textContent = `${day.totalCalories} kcal`;
        
        totalDiv.appendChild(totalLabel);
        totalDiv.appendChild(totalVal);
        itemDiv.appendChild(totalDiv);
        
        listContainer.appendChild(itemDiv);
    });
}

// Auth state changes are handled centrally by js/auth.js which calls loadFoodLog(session)

// Global exports for window access
if (typeof window !== 'undefined') {
    window.loadFoodLog = loadFoodLog;
    window.saveFoodLog = saveFoodLog;
    window.addFoodEntry = addFoodEntry;
    window.removeFoodEntry = removeFoodEntry;
    window.renderFoodLog = renderFoodLog;
    window.renderFoodHistory = renderFoodHistory;
    window.deleteFoodHistoryDay = deleteFoodHistoryDay;
    window.openFoodSelector = openFoodSelector;
    window.closeFoodSelector = closeFoodSelector;
    window.handleFoodSearch = handleFoodSearch;
    window.selectFoodSuggestion = selectFoodSuggestion;
}
