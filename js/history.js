let weightHistory = []; // Local in-memory state, synchronized with Supabase (authenticated) or localStorage (guest)
let editingWeightId = null;
let activeLoadedWeightSessionId = '__uninitialized__';
let activeWeightLoadPromise = null;
let activeLoadWeightTargetSessionId = null;
let currentWeightLoadRequestId = 0;

const WEIGHT_STORAGE_KEY = 'nutritrack_weight_history';

/**
 * Loads persisted weight records from Supabase public.weight_logs (authenticated) or localStorage (guest).
 * Ensures full account isolation: authenticated users load only rows where user_id = session.id.
 * Protected against race conditions and duplicate concurrent fetches using session tracking and request sequencing.
 * @param {object|null} [explicitSession=null] - Optional Supabase session
 * @returns {Promise<void>}
 */
async function loadWeightHistory(explicitSession = null) {
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
                if (typeof currentAuthSession !== 'undefined' && !currentAuthSession) currentAuthSession = data.session;
                if (typeof currentAuthUser !== 'undefined' && !currentAuthUser) currentAuthUser = data.session.user;
                if (typeof updateAuthMenuUI === 'function') updateAuthMenuUI();
            }
        } catch (e) {
            console.warn('loadWeightHistory: error inspecting Supabase session directly:', e);
        }
    }

    const targetSessionId = targetSession ? (targetSession.user?.id || targetSession.id || null) : null;

    // If session identity changed, immediately clear stale state and update UI to avoid rendering previous user's data
    if (activeLoadedWeightSessionId !== '__uninitialized__' && activeLoadedWeightSessionId !== targetSessionId) {
        activeLoadedWeightSessionId = targetSessionId;
        weightHistory = [];
        renderWeightHistory(weightHistory);
        renderWeightProgress(weightHistory);
        updateWeightSummary(weightHistory);
    }

    // If an in-flight load is targeting the exact same session ID, reuse it
    if (activeWeightLoadPromise && activeLoadWeightTargetSessionId === targetSessionId) {
        return activeWeightLoadPromise;
    }

    const requestId = ++currentWeightLoadRequestId;
    activeLoadWeightTargetSessionId = targetSessionId;

    const currentPromise = (async () => {
        try {
            await _performLoadWeightHistory(targetSession, requestId);
        } finally {
            if (activeWeightLoadPromise === currentPromise) {
                activeWeightLoadPromise = null;
                activeLoadWeightTargetSessionId = null;
            }
        }
    })();

    activeWeightLoadPromise = currentPromise;
    return currentPromise;
}

/**
 * Internal execution of weight history loading with sequence verification
 * @param {object|null} session
 * @param {number} requestId
 */
async function _performLoadWeightHistory(session, requestId) {
    const errorMsg = document.getElementById('weight-error');

    // 1. Authenticated User Flow: Supabase public.weight_logs
    if (session && session.id) {
        const client = window.supabaseClient;
        if (!client) {
            console.warn('Supabase client unavailable while loading weight history.');
            if (requestId === currentWeightLoadRequestId) {
                activeLoadedWeightSessionId = session.id;
                weightHistory = [];
                renderWeightHistory(weightHistory);
                renderWeightProgress(weightHistory);
                updateWeightSummary(weightHistory);
            }
            return;
        }

        try {
            const { data, error } = await client
                .from('weight_logs')
                .select('id, user_id, weight, recorded_at, created_at')
                .eq('user_id', session.id)
                .order('recorded_at', { ascending: false });

            if (requestId !== currentWeightLoadRequestId) {
                return; // Newer request already initiated
            }

            activeLoadedWeightSessionId = session.id;

            if (error) {
                console.error('Error loading weight history from Supabase:', error);
                if (errorMsg) {
                    let friendlyMsg = error.message || 'Unable to load weight records.';
                    if (friendlyMsg.toLowerCase().includes('permission denied')) {
                        friendlyMsg = 'Database permission denied: unable to read from weight_logs. Table permissions or RLS policy may be missing.';
                    }
                    errorMsg.textContent = friendlyMsg;
                    errorMsg.style.display = 'block';
                }
                // Never display stale or other user's records on failure
                weightHistory = [];
            } else {
                if (errorMsg) errorMsg.style.display = 'none';
                weightHistory = (data || []).map(r => ({
                    id: String(r.id),
                    user_id: r.user_id,
                    weight: parseFloat(r.weight),
                    recorded_at: String(r.recorded_at).split('T')[0],
                    created_at: r.created_at
                }));
            }
        } catch (err) {
            if (requestId !== currentWeightLoadRequestId) return;
            console.error('Unexpected exception loading weight history from Supabase:', err);
            if (errorMsg) {
                errorMsg.textContent = 'An unexpected error occurred while loading your weight history.';
                errorMsg.style.display = 'block';
            }
            activeLoadedWeightSessionId = session.id;
            weightHistory = [];
        }
    } else {
        // 2. Guest User Flow: localStorage
        if (requestId !== currentWeightLoadRequestId) return;
        activeLoadedWeightSessionId = null;
        if (errorMsg) errorMsg.style.display = 'none';
        try {
            const saved = localStorage.getItem(WEIGHT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    // Only load pure guest records (no user_id and no foreign user_email)
                    weightHistory = parsed
                        .filter(r => !r.user_id && !r.user_email)
                        .map((r, idx) => ({
                            ...r,
                            id: r.id ? String(r.id) : ('rec_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 7)),
                            weight: parseFloat(r.weight),
                            recorded_at: String(r.recorded_at).split('T')[0]
                        }));
                } else {
                    weightHistory = [];
                }
            } else {
                weightHistory = [];
            }
        } catch (e) {
            console.warn('Error reading weight history from localStorage:', e);
            weightHistory = [];
        }
    }

    if (requestId === currentWeightLoadRequestId) {
        renderWeightHistory(weightHistory);
        renderWeightProgress(weightHistory);
        updateWeightSummary(weightHistory);
    }
}

/**
 * Persists guest weight records into localStorage.
 * Authenticated records are never saved to localStorage to prevent data leakage.
 */
function saveWeightHistory() {
    const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    if (session && session.id) {
        return; // Authenticated records persist to Supabase only
    }
    try {
        localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify(weightHistory));
    } catch (e) {
        console.warn('Error saving weight history to localStorage:', e);
    }
}

// Automatically load existing records
loadWeightHistory();

/**
 * Validates a weight value and date string
 * @param {number} weight
 * @param {string} dateStr
 * @returns {string|null}
 */
function validateWeight(weight, dateStr) {
    if (!weight || isNaN(weight)) return "Please enter a valid weight.";
    if (weight <= 0) return "Weight must be greater than 0.";
    if (weight > 500) return "Please enter a realistic weight.";
    if (!dateStr) return "Please select a date.";
    return null; // Valid
}

/**
 * Formats a weight difference cleanly (e.g., '+2 kg', '+3 kg', '-2 kg', 'No change', or 'Initial')
 * @param {number|null} diff
 * @returns {string}
 */
function formatWeightDiff(diff) {
    if (diff === null || diff === undefined) return 'Initial';
    if (Math.abs(diff) < 0.05) return 'No change';
    const rounded = Math.round(diff * 10) / 10;
    const absVal = Math.abs(rounded);
    const numStr = Number.isInteger(absVal) ? absVal.toString() : absVal.toFixed(1);
    return rounded > 0 ? `+${numStr} kg` : `-${numStr} kg`;
}

/**
 * Validates a weight record structure
 * @param {object} record
 * @returns {boolean}
 */
function isValidWeightRecord(record) {
    if (!record || typeof record !== 'object') return false;
    const w = parseFloat(record.weight);
    if (isNaN(w) || w <= 0 || w > 500) return false;
    if (!record.recorded_at) return false;
    const d = new Date(record.recorded_at);
    return !isNaN(d.getTime());
}

/**
 * Filters records to only include the active user's records.
 * Strictly separates authenticated records from guest records.
 * @param {Array} records
 * @returns {Array}
 */
function getUserWeightRecords(records) {
    const list = (records && Array.isArray(records)) ? records : weightHistory;

    let currentEmail = null;
    let currentUserId = null;
    if (typeof getAuthSession === 'function') {
        const session = getAuthSession();
        if (session) {
            if (session.email) currentEmail = session.email.trim().toLowerCase();
            if (session.id) currentUserId = session.id;
        }
    }

    return list.filter(record => {
        if (!isValidWeightRecord(record)) return false;
        // Authenticated Supabase records matched by user_id
        if (currentUserId && record.user_id) {
            return record.user_id === currentUserId;
        }
        // Legacy localStorage records matched by user_email
        if (record.user_email && currentEmail && record.user_email.toLowerCase() !== currentEmail) {
            return false;
        }
        // When logged in as authenticated user, exclude pure guest records
        if (currentUserId && !record.user_id && !record.user_email) {
            return false;
        }
        // When guest, exclude any record belonging to authenticated accounts
        if (!currentUserId && (record.user_id || record.user_email)) {
            return false;
        }
        return true;
    });
}

/**
 * Returns valid user records within the 6-month time range (relative to latest entry or today)
 * Five valid entries are sufficient even if recorded within a shorter period.
 * @param {Array} records
 * @returns {Array}
 */
function getSixMonthsWeightRecords(records) {
    const userRecords = getUserWeightRecords(records);
    if (userRecords.length === 0) return [];

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate(), 0, 0, 0, 0);

    const validWithDates = userRecords.map(r => {
        const dateStr = String(r.recorded_at).split('T')[0];
        const parts = dateStr.split('-');
        let d;
        if (parts.length === 3) {
            d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else {
            d = new Date(r.recorded_at);
        }
        return { record: r, date: d, time: d.getTime() };
    }).filter(item => !isNaN(item.time));

    if (validWithDates.length === 0) return [];

    const latestRecordTime = Math.max(...validWithDates.map(item => item.time));
    let windowEnd = now.getTime();
    if (latestRecordTime < sixMonthsAgo.getTime()) {
        windowEnd = latestRecordTime;
    } else if (latestRecordTime > now.getTime()) {
        windowEnd = latestRecordTime;
    }

    const windowEndDate = new Date(windowEnd);
    const windowStartDate = new Date(windowEndDate.getFullYear(), windowEndDate.getMonth() - 6, windowEndDate.getDate(), 0, 0, 0, 0);

    return validWithDates
        .filter(item => item.date >= windowStartDate && item.date <= new Date(windowEnd + 86400000))
        .map(item => item.record);
}

/**
 * Saves a new weight record or updates an existing record.
 * Uses Supabase public.weight_logs for authenticated users and localStorage for guests.
 * @param {Event} event
 */
async function recordWeight(event) {
    event.preventDefault();
    const dateInput = document.getElementById('weight-date');
    const weightInput = document.getElementById('weight-input');
    const errorMsg = document.getElementById('weight-error');
    const submitBtn = document.getElementById('weight-submit-btn');

    if (!dateInput || !weightInput || !errorMsg) return;

    const dateStr = dateInput.value;
    const weightVal = parseFloat(weightInput.value);

    // Validation
    const error = validateWeight(weightVal, dateStr);
    if (error) {
        errorMsg.textContent = error;
        errorMsg.style.display = 'block';
        return;
    }

    // Clear error
    errorMsg.style.display = 'none';

    const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    const originalBtnText = submitBtn ? submitBtn.textContent : (editingWeightId !== null ? 'Update Weight' : 'Save');

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
    }

    try {
        if (session && session.id) {
            // --- Authenticated User: Supabase public.weight_logs ---
            const client = window.supabaseClient;
            if (!client) {
                throw new Error('Database service is currently unavailable. Please reload the page.');
            }

            if (editingWeightId !== null) {
                // Update existing record with explicit record ID and user_id filter
                const { error: updateErr } = await client
                    .from('weight_logs')
                    .update({
                        weight: weightVal,
                        recorded_at: dateStr
                    })
                    .eq('id', editingWeightId)
                    .eq('user_id', session.id);

                if (updateErr) {
                    throw updateErr;
                }

                // Update in-memory record on confirmed database success
                const recordIndex = weightHistory.findIndex(r => String(r.id) === String(editingWeightId));
                if (recordIndex !== -1) {
                    weightHistory[recordIndex].weight = weightVal;
                    weightHistory[recordIndex].recorded_at = dateStr;
                }
                editingWeightId = null;
            } else {
                // Insert new record into Supabase
                const { data: newRow, error: insertErr } = await client
                    .from('weight_logs')
                    .insert({
                        user_id: session.id,
                        weight: weightVal,
                        recorded_at: dateStr
                    })
                    .select('id, user_id, weight, recorded_at, created_at')
                    .single();

                if (insertErr) {
                    throw insertErr;
                }

                if (newRow) {
                    weightHistory.push({
                        id: String(newRow.id),
                        user_id: newRow.user_id,
                        weight: parseFloat(newRow.weight),
                        recorded_at: String(newRow.recorded_at).split('T')[0],
                        created_at: newRow.created_at
                    });
                } else {
                    await loadWeightHistory();
                    return;
                }
            }
        } else {
            // --- Guest User: localStorage ---
            if (editingWeightId !== null) {
                const recordIndex = weightHistory.findIndex(r => String(r.id) === String(editingWeightId));
                if (recordIndex !== -1) {
                    weightHistory[recordIndex].weight = weightVal;
                    weightHistory[recordIndex].recorded_at = dateStr;
                }
                editingWeightId = null;
            } else {
                const newRecord = {
                    id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                    weight: weightVal,
                    recorded_at: dateStr
                };
                weightHistory.push(newRecord);
            }
            saveWeightHistory();
        }

        // Sort descending by date (newest first)
        weightHistory.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));

        // Clear form inputs on success
        dateInput.value = '';
        weightInput.value = '';

        // Re-render UI
        renderWeightHistory(weightHistory);
        renderWeightProgress(weightHistory);
        updateWeightSummary(weightHistory);
    } catch (err) {
        console.error('Error saving weight record:', err);
        let message = err.message || 'Failed to save weight record. Please try again.';
        if (message.toLowerCase().includes('permission denied')) {
            message = 'Database permission denied: unable to write to weight_logs. Table permissions or RLS policy may be missing for authenticated role.';
        }
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = editingWeightId !== null ? 'Update Weight' : 'Save';
        }
    }
}

/**
 * Prepares the form to edit an existing weight record
 * @param {string|number} id
 * @param {number} [index]
 */
function editWeightRecord(id, index) {
    let targetIndex = -1;
    if (id !== undefined && id !== null && id !== '') {
        targetIndex = weightHistory.findIndex(r => String(r.id) === String(id));
    }
    if (targetIndex === -1 && typeof index === 'number' && index >= 0 && index < weightHistory.length) {
        targetIndex = index;
    }
    if (targetIndex === -1) return;

    const record = weightHistory[targetIndex];
    const dateInput = document.getElementById('weight-date');
    const weightInput = document.getElementById('weight-input');
    const submitBtn = document.getElementById('weight-submit-btn');

    if (dateInput) dateInput.value = record.recorded_at;
    if (weightInput) weightInput.value = record.weight;

    editingWeightId = String(record.id);
    if (submitBtn) submitBtn.textContent = 'Update Weight';

    // Scroll smoothly to the form
    if (dateInput) dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Deletes a weight record with confirmation prompt.
 * Authenticated records are deleted from Supabase public.weight_logs with explicit user_id filter.
 * @param {string|number} id
 * @param {number} [index]
 */
async function deleteWeightRecord(id, index) {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        try {
            const confirmed = window.confirm("Are you sure you want to delete this weight record?");
            if (!confirmed) return;
        } catch (e) {
            console.warn('confirm prompt bypassed:', e);
        }
    }

    let targetIndex = -1;
    if (id !== undefined && id !== null && id !== '') {
        targetIndex = weightHistory.findIndex(r => String(r.id) === String(id));
    }
    if (targetIndex === -1 && typeof index === 'number' && index >= 0 && index < weightHistory.length) {
        targetIndex = index;
    }

    if (targetIndex === -1) {
        console.warn('Could not find record to delete:', id, index);
        return;
    }

    const targetRecord = weightHistory[targetIndex];
    const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    const errorMsg = document.getElementById('weight-error');

    if (session && session.id) {
        // --- Authenticated delete in Supabase ---
        const client = window.supabaseClient;
        if (!client) {
            alert('Database service unavailable. Please reload the page.');
            return;
        }

        try {
            const { error } = await client
                .from('weight_logs')
                .delete()
                .eq('id', targetRecord.id)
                .eq('user_id', session.id);

            if (error) {
                console.error('Error deleting weight record from Supabase:', error);
                let message = error.message || 'Unable to delete weight record.';
                if (message.toLowerCase().includes('permission denied')) {
                    message = 'Database permission denied: unable to delete from weight_logs. Table permissions or RLS policy may be missing.';
                }
                if (errorMsg) {
                    errorMsg.textContent = message;
                    errorMsg.style.display = 'block';
                } else {
                    alert('Delete failed: ' + message);
                }
                return;
            }
        } catch (err) {
            console.error('Unexpected error deleting weight record from Supabase:', err);
            alert('Unexpected error deleting record. Please try again.');
            return;
        }
    }

    // Remove from in-memory list on confirmed success
    weightHistory.splice(targetIndex, 1);

    if (!session || !session.id) {
        // For guest mode only, update localStorage
        saveWeightHistory();
    }

    // If currently editing the deleted record, cancel edit mode
    if (editingWeightId !== null && (String(editingWeightId) === String(id) || String(editingWeightId) === String(targetRecord.id))) {
        editingWeightId = null;
        const submitBtn = document.getElementById('weight-submit-btn');
        if (submitBtn) submitBtn.textContent = 'Save';
        const dateInput = document.getElementById('weight-date');
        const weightInput = document.getElementById('weight-input');
        if (dateInput) dateInput.value = '';
        if (weightInput) weightInput.value = '';
    }

    if (errorMsg) errorMsg.style.display = 'none';

    // Re-render UI
    renderWeightHistory(weightHistory);
    renderWeightProgress(weightHistory);
    updateWeightSummary(weightHistory);
}

/**
 * Updates summary cards distinguishing Total Change from Recent Change
 * @param {Array} records
 */
function updateWeightSummary(records) {
    const statStarting = document.getElementById('stat-starting');
    const statCurrent = document.getElementById('stat-current');
    const statChange = document.getElementById('stat-change');

    if (!statStarting || !statCurrent || !statChange) return;

    const userRecords = getUserWeightRecords(records);

    // Update label to clearly indicate Total Change
    const changeLabel = document.querySelector('.stat-box.diff .stat-label');
    if (changeLabel) {
        changeLabel.textContent = 'Total Change';
    }

    let recentEl = document.getElementById('stat-recent-change');
    if (!recentEl) {
        const diffBox = document.querySelector('.stat-box.diff');
        if (diffBox) {
            recentEl = document.createElement('span');
            recentEl.id = 'stat-recent-change';
            recentEl.style.fontSize = '0.75rem';
            recentEl.style.marginTop = '2px';
            recentEl.style.fontWeight = '500';
            diffBox.appendChild(recentEl);
        }
    }

    if (!userRecords || userRecords.length === 0) {
        statStarting.textContent = '-- kg';
        statCurrent.textContent = '-- kg';
        statChange.textContent = '-- kg';
        statChange.style.color = 'var(--text-muted, #718096)';
        if (recentEl) {
            recentEl.textContent = 'Recent: --';
            recentEl.style.color = 'var(--text-muted, #718096)';
        }
        return;
    }

    // Sort ascending by date
    const sortedAsc = [...userRecords].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    const startingWeight = sortedAsc[0].weight;
    const currentWeight = sortedAsc[sortedAsc.length - 1].weight;
    const totalChange = currentWeight - startingWeight;

    statStarting.textContent = `${startingWeight.toFixed(1)} kg`;
    statCurrent.textContent = `${currentWeight.toFixed(1)} kg`;

    // Total change formatting
    const totalDiffStr = formatWeightDiff(totalChange);
    statChange.textContent = totalDiffStr;
    if (totalChange > 0.05) {
        statChange.style.color = '#e53e3e'; // red for gain
    } else if (totalChange < -0.05) {
        statChange.style.color = '#38a169'; // green for loss
    } else {
        statChange.textContent = '0 kg';
        statChange.style.color = 'var(--text-muted, #718096)';
    }

    // Consecutive/recent change from the previous entry
    if (recentEl) {
        if (sortedAsc.length >= 2) {
            const prevWeight = sortedAsc[sortedAsc.length - 2].weight;
            const recentDiff = currentWeight - prevWeight;
            const recentDiffStr = formatWeightDiff(recentDiff);
            recentEl.textContent = `Recent: ${recentDiffStr}`;
            if (recentDiff > 0.05) {
                recentEl.style.color = '#e53e3e';
            } else if (recentDiff < -0.05) {
                recentEl.style.color = '#38a169';
            } else {
                recentEl.style.color = 'var(--text-muted, #718096)';
            }
        } else {
            recentEl.textContent = 'Recent: Initial';
            recentEl.style.color = 'var(--text-muted, #718096)';
        }
    }
}

/**
 * Renders the weight history list with consecutive differences for each entry
 * @param {Array} records
 */
function renderWeightHistory(records) {
    // If the active auth session has changed since the last load, trigger a fresh load
    const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    const currentSessionId = (session && session.id) ? session.id : null;
    if (activeLoadedWeightSessionId !== '__uninitialized__' && currentSessionId !== activeLoadedWeightSessionId) {
        if (!activeWeightLoadPromise) {
            loadWeightHistory();
        }
        return;
    }

    const emptyState = document.getElementById('weight-empty-state');
    const listContainer = document.getElementById('weight-history-list');

    if (!emptyState || !listContainer) return;

    const userRecords = getUserWeightRecords(records);

    if (!userRecords || userRecords.length === 0) {
        emptyState.style.display = 'block';
        listContainer.style.display = 'none';
        listContainer.innerHTML = '';
        return;
    }

    emptyState.style.display = 'none';
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'column';
    listContainer.style.gap = '8px';
    listContainer.innerHTML = '';

    // 1. Calculate consecutive weight difference between consecutive chronological entries
    const sortedAsc = [...userRecords].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    const diffMap = new Map();

    sortedAsc.forEach((record, index) => {
        if (index === 0) {
            diffMap.set(String(record.id), null); // Earliest/initial entry
        } else {
            const prev = sortedAsc[index - 1];
            const diff = record.weight - prev.weight;
            diffMap.set(String(record.id), diff);
        }
    });

    // 2. Display descending (newest on top)
    const sortedDesc = [...userRecords].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));

    sortedDesc.forEach(record => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.padding = '12px 14px';
        item.style.backgroundColor = 'var(--card-bg, #ffffff)';
        item.style.borderRadius = 'var(--radius-md, 8px)';
        item.style.boxShadow = 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))';
        item.style.border = '1px solid var(--border-color, #e2e8f0)';

        // Left side: Date
        const dateSpan = document.createElement('span');
        dateSpan.style.fontWeight = '500';
        dateSpan.style.color = 'var(--text-main, #111111)';
        const parts = String(record.recorded_at).split('T')[0].split('-');
        const dateDisplay = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : record.recorded_at;
        dateSpan.textContent = dateDisplay;

        // Right side: Difference badge, Weight, Edit button, Delete button
        const rightContainer = document.createElement('div');
        rightContainer.style.display = 'flex';
        rightContainer.style.alignItems = 'center';
        rightContainer.style.gap = '10px';

        // Consecutive difference badge
        const diff = diffMap.get(String(record.id));
        const diffSpan = document.createElement('span');
        diffSpan.className = 'weight-diff-badge';
        diffSpan.style.fontSize = '0.85rem';
        diffSpan.style.fontWeight = '600';
        diffSpan.style.padding = '2px 6px';
        diffSpan.style.borderRadius = '4px';

        if (diff === null || diff === undefined) {
            diffSpan.textContent = 'Initial';
            diffSpan.style.color = 'var(--text-muted, #718096)';
            diffSpan.style.backgroundColor = 'rgba(0,0,0,0.04)';
        } else {
            const diffText = formatWeightDiff(diff);
            diffSpan.textContent = diffText;
            if (diff > 0.05) {
                diffSpan.style.color = '#e53e3e'; // Gain (red)
                diffSpan.style.backgroundColor = 'rgba(229, 62, 62, 0.1)';
            } else if (diff < -0.05) {
                diffSpan.style.color = '#38a169'; // Loss (green)
                diffSpan.style.backgroundColor = 'rgba(56, 161, 105, 0.1)';
            } else {
                diffSpan.style.color = 'var(--text-muted, #718096)';
                diffSpan.style.backgroundColor = 'rgba(0,0,0,0.04)';
            }
        }

        // Weight value
        const weightSpan = document.createElement('span');
        weightSpan.style.fontWeight = 'bold';
        weightSpan.style.color = 'var(--primary-color, #d53f8c)';
        weightSpan.style.minWidth = '60px';
        weightSpan.style.textAlign = 'right';
        weightSpan.textContent = `${record.weight.toFixed(1)} kg`;

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'weight-edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.style.background = 'none';
        editBtn.style.border = 'none';
        editBtn.style.cursor = 'pointer';
        editBtn.style.fontSize = '0.9rem';
        editBtn.style.color = 'var(--primary-color, #d53f8c)';
        editBtn.style.fontWeight = '500';
        editBtn.style.textDecoration = 'underline';
        editBtn.style.padding = '4px 6px';
        editBtn.title = "Edit record";
        editBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            editWeightRecord(record.id);
        };

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'weight-delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.style.background = 'none';
        deleteBtn.style.border = 'none';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontSize = '1.1rem';
        deleteBtn.style.opacity = '0.75';
        deleteBtn.style.padding = '4px 6px';
        deleteBtn.title = "Delete record";
        deleteBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            deleteWeightRecord(record.id);
        };

        rightContainer.appendChild(diffSpan);
        rightContainer.appendChild(weightSpan);
        rightContainer.appendChild(editBtn);
        rightContainer.appendChild(deleteBtn);

        item.appendChild(dateSpan);
        item.appendChild(rightContainer);
        listContainer.appendChild(item);
    });
}

/**
 * Renders the weight progress graph or friendly empty state
 * Requires at least 5 valid entries to unlock the graph.
 * @param {Array} records
 */
function renderWeightProgress(records) {
    const container = document.querySelector('.chart-placeholder');
    if (!container) return;

    // Filter to valid user records (count all valid entries belonging to the user)
    const userRecords = getUserWeightRecords(records);
    const count = userRecords.length;

    // Requirement: Graph appears at exactly 5 valid entries
    if (count < 5) {
        container.style.height = '150px';
        container.style.minHeight = '150px';
        container.style.border = '1px dashed var(--border-color, #f7dbe3)';
        container.style.backgroundColor = 'var(--primary-bg, #faeab8)';
        container.style.padding = '16px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.borderRadius = 'var(--radius-md, 12px)';

        let msgContent = '';
        if (count === 0) {
            msgContent = `
                <div style="font-size: 2rem; margin-bottom: 8px;">📊</div>
                <p style="font-weight: 600; margin-bottom: 4px; color: var(--text-main);">Weight Progress Chart</p>
                <span class="coming-soon-text" style="color: var(--text-muted); text-align: center; max-width: 320px; display: block; font-size: 0.9rem;">
                    Add 5 weight entries to unlock your graph.
                </span>
            `;
        } else {
            const needed = 5 - count;
            const entryWord = needed === 1 ? 'entry' : 'entries';
            msgContent = `
                <div style="font-size: 2rem; margin-bottom: 8px;">📊</div>
                <p style="font-weight: 600; margin-bottom: 4px; color: var(--text-main);">Weight Progress Chart</p>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary-color, #d53f8c); margin-bottom: 4px;">
                    ${count}/5 progress
                </div>
                <span class="coming-soon-text" style="color: var(--text-muted); text-align: center; max-width: 320px; display: block; font-size: 0.9rem;">
                    Add ${needed} more weight ${entryWord} to unlock your graph.
                </span>
            `;
        }
        container.innerHTML = msgContent;
        return;
    }

    // Sort chronologically ascending for the chart
    const sorted = [...userRecords].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    const totalPoints = sorted.length;

    const weights = sorted.map(r => parseFloat(r.weight));
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const paddingW = (maxW - minW) * 0.15 || 1.0;
    const yMin = Math.max(0, Math.floor((minW - paddingW) * 10) / 10);
    const yMax = Math.ceil((maxW + paddingW) * 10) / 10;
    const yRange = (yMax - yMin) || 1;

    const svgWidth = 500;
    const svgHeight = 180;
    const padLeft = 45;
    const padRight = 30;
    const padTop = 25;
    const padBottom = 35;
    const plotWidth = svgWidth - padLeft - padRight;
    const plotHeight = svgHeight - padTop - padBottom;

    const points = sorted.map((r, i) => {
        const x = totalPoints === 1 ? (padLeft + plotWidth / 2) : (padLeft + (i / (totalPoints - 1)) * plotWidth);
        const y = padTop + plotHeight - ((r.weight - yMin) / yRange) * plotHeight;
        return { x, y, record: r };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `M ${points[0].x.toFixed(1)} ${padTop + plotHeight} ` +
        points.map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${points[points.length - 1].x.toFixed(1)} ${padTop + plotHeight} Z`;

    const midW = (yMin + yMax) / 2;
    const yLevels = [
        { val: yMax, y: padTop },
        { val: midW, y: padTop + plotHeight / 2 },
        { val: yMin, y: padTop + plotHeight }
    ];

    const gridLinesHtml = yLevels.map(lvl => `
        <line x1="${padLeft}" y1="${lvl.y.toFixed(1)}" x2="${(svgWidth - padRight).toFixed(1)}" y2="${lvl.y.toFixed(1)}" stroke="rgba(0,0,0,0.08)" stroke-dasharray="4,4" stroke-width="1" />
        <text x="${(padLeft - 6).toFixed(1)}" y="${(lvl.y + 3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--text-muted, #718096)" font-weight="500">${lvl.val.toFixed(1)}</text>
    `).join('');

    const pointsHtml = points.map(p => {
        const parts = String(p.record.recorded_at).split('T')[0].split('-');
        const dateLabel = parts.length === 3 ? `${parts[2]}/${parts[1]}` : p.record.recorded_at;
        return `
            <g class="chart-point-group">
                <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="var(--primary-color, #d53f8c)" stroke="#ffffff" stroke-width="2" />
                <text x="${p.x.toFixed(1)}" y="${(p.y - 7).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text-main, #111111)">${p.record.weight.toFixed(1)}</text>
                <text x="${p.x.toFixed(1)}" y="${(svgHeight - 12).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--text-muted, #718096)">${dateLabel}</text>
            </g>
        `;
    }).join('');

    // Style container for graph view
    container.style.height = 'auto';
    container.style.minHeight = '180px';
    container.style.border = '1px solid var(--border-color, #f7dbe3)';
    container.style.backgroundColor = 'var(--card-bg, #ffeef2)';
    container.style.padding = '14px';
    container.style.display = 'block';
    container.style.borderRadius = 'var(--radius-md, 12px)';

    container.innerHTML = `
        <div style="width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <span style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);">Weight Progress Chart</span>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">${totalPoints} entries</span>
            </div>
            <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: auto; display: block; overflow: visible;" role="img" aria-label="Weight progress chart">
                <defs>
                    <linearGradient id="weightChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--primary-color, #d53f8c)" stop-opacity="0.25"/>
                        <stop offset="100%" stop-color="var(--primary-color, #d53f8c)" stop-opacity="0.02"/>
                    </linearGradient>
                </defs>
                ${gridLinesHtml}
                <path d="${areaPath}" fill="url(#weightChartGrad)" />
                <path d="${linePath}" fill="none" stroke="var(--primary-color, #d53f8c)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                ${pointsHtml}
            </svg>
        </div>
    `;
}

// Global exports for window access
if (typeof window !== 'undefined') {
    window.loadWeightHistory = loadWeightHistory;
    window.saveWeightHistory = saveWeightHistory;
    window.recordWeight = recordWeight;
    window.editWeightRecord = editWeightRecord;
    window.deleteWeightRecord = deleteWeightRecord;
    window.renderWeightHistory = renderWeightHistory;
    window.renderWeightProgress = renderWeightProgress;
    window.updateWeightSummary = updateWeightSummary;
    window.getUserWeightRecords = getUserWeightRecords;
}
