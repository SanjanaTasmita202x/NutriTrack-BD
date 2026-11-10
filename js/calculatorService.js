// js/calculatorService.js
// NutriTrack BD — Minimal BMR/TDEE History Persistence Service
// Handles authenticated adult BMR/TDEE RPC persistence safely and asynchronously.
// BMI remains strictly local-only and is not handled by this service.

(function () {
    let isPersisting = false;

    /**
     * Singleton calculatorService exposed on window
     */
    window.calculatorService = {
        /**
         * Persists an authenticated adult BMR/TDEE calculation via Supabase RPC.
         * Safe, non-blocking: never throws unhandled rejections, never mutates local DOM results.
         * 
         * @param {Object} params
         * @param {number} params.age - Current submitted age (18–120)
         * @param {string} params.gender - 'male' | 'female'
         * @param {number} params.heightCm - Height in cm (50–280)
         * @param {number} params.weightKg - Weight in kg (20–400)
         * @param {number|null} [params.activityMultiplier=null] - Activity multiplier (1.0–2.5)
         * @param {string|null} [params.goal=null] - 'lose' | 'maintain' | 'gain'
         * @param {number|null} [params.targetWeightKg=null] - Target weight in kg (20–400)
         * @returns {Promise<{success: boolean, data?: any, error?: string, skipped?: string}>}
         */
        async logBmrCalculation(params) {
            // 1. Guard against duplicate concurrent requests without permanently blocking future attempts
            if (isPersisting) {
                return { success: false, skipped: 'concurrent_request' };
            }

            // 2. Authentication check: guests must never dispatch calculator-history RPC
            const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
            if (!session || !session.id || typeof session.id !== 'string' || session.id.trim() === '') {
                return { success: false, skipped: 'guest_mode' };
            }

            // 3. Current submission age check: must be an adult between 18 and 120
            const age = parseInt(params.age, 10);
            if (isNaN(age) || age < 18 || age > 120) {
                return { success: false, skipped: 'minor_or_invalid_age' };
            }

            // 4. Verify Supabase client availability
            const client = window.supabaseClient;
            if (!client || typeof client.rpc !== 'function') {
                console.warn('Supabase client unavailable for BMR persistence.');
                return { success: false, skipped: 'supabase_unavailable' };
            }

            // 5. Construct exact 7-parameter RPC payload (never send client-supplied user_id)
            const payload = {
                p_age: age,
                p_gender: String(params.gender || '').trim().toLowerCase(),
                p_height_cm: parseFloat(params.heightCm),
                p_weight_kg: parseFloat(params.weightKg),
                p_activity_multiplier: (params.activityMultiplier !== null && params.activityMultiplier !== undefined && !isNaN(params.activityMultiplier))
                    ? parseFloat(params.activityMultiplier)
                    : null,
                p_goal: (params.goal && typeof params.goal === 'string' && params.goal.trim() !== '')
                    ? params.goal.trim().toLowerCase()
                    : null,
                p_target_weight_kg: (params.targetWeightKg !== null && params.targetWeightKg !== undefined && !isNaN(params.targetWeightKg))
                    ? parseFloat(params.targetWeightKg)
                    : null
            };

            // 6. Execute RPC with guaranteed concurrency reset and error boundary
            isPersisting = true;
            try {
                const { data, error } = await client.rpc('calculate_and_log_bmr', payload);

                // Check error field directly; do not make assumptions about data shape
                if (error) {
                    console.warn('BMR persistence RPC returned error:', error.message || error);
                    return { success: false, error: error.message || String(error) };
                }

                return { success: true, data: data };
            } catch (err) {
                console.warn('Unexpected exception during BMR persistence:', err);
                return { success: false, error: err.message || String(err) };
            } finally {
                // Ensure concurrency flag is always cleared for subsequent calculations
                isPersisting = false;
            }
        }
    };
})();
