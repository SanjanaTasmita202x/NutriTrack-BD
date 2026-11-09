// Profile Management & Supabase Database Integration
// Authoritative persistent storage for authenticated user profiles via Supabase public.profiles.
// In-memory profile caching for active UI and BMI/BMR calculations.
// Isolated guest fallback via 'nutritrack_profile_guest'.

let activeUserProfile = null;

/**
 * Checks age input and toggles parental/guardian supervision advisory for children under 12
 */
function checkAgeNotice() {
    const ageInput = document.getElementById('profile-age');
    const notice = document.getElementById('under-12-notice');
    if (ageInput && notice) {
        const age = parseInt(ageInput.value, 10);
        if (!isNaN(age) && age > 0 && age < 12) {
            notice.style.display = 'block';
        } else {
            notice.style.display = 'none';
        }
    }
}

/**
 * Resets profile form inputs and clears in-memory profile state
 */
function resetProfileForm() {
    activeUserProfile = null;
    const nameInput = document.getElementById('profile-name');
    const ageInput = document.getElementById('profile-age');
    const genderInput = document.getElementById('profile-gender');
    const heightInput = document.getElementById('profile-height');
    const weightInput = document.getElementById('profile-weight');
    const notice = document.getElementById('under-12-notice');

    if (nameInput) nameInput.value = '';
    if (ageInput) ageInput.value = '';
    if (genderInput) genderInput.value = '';
    if (heightInput) heightInput.value = '';
    if (weightInput) weightInput.value = '';
    if (notice) notice.style.display = 'none';
}

/**
 * Loads profile for the current user.
 * - Authenticated users: queries Supabase public.profiles by authenticated UUID (session.id).
 * - Guest users: loads from 'nutritrack_profile_guest' in localStorage.
 * Does not show stale local data if Supabase loading fails.
 */
async function loadProfile() {
    const session = typeof getAuthSession === 'function' ? getAuthSession() : null;

    if (session && session.id) {
        const client = window.supabaseClient;
        if (!client) {
            console.warn('Supabase client unavailable while loading profile.');
            activeUserProfile = null;
            resetProfileForm();
            return;
        }

        try {
            const { data, error } = await client
                .from('profiles')
                .select('name, age, gender, height, weight')
                .eq('id', session.id)
                .maybeSingle();

            if (error) {
                console.error('Error loading profile from Supabase:', error);
                // Do not show stale local profile data when Supabase loading fails
                activeUserProfile = null;
                resetProfileForm();
                return;
            }

            if (data) {
                activeUserProfile = {
                    name: data.name || '',
                    age: data.age !== null && data.age !== undefined ? Number(data.age) : null,
                    gender: data.gender || '',
                    height: data.height !== null && data.height !== undefined ? Number(data.height) : null,
                    weight: data.weight !== null && data.weight !== undefined ? Number(data.weight) : null
                };

                const nameInput = document.getElementById('profile-name');
                const ageInput = document.getElementById('profile-age');
                const genderInput = document.getElementById('profile-gender');
                const heightInput = document.getElementById('profile-height');
                const weightInput = document.getElementById('profile-weight');

                if (nameInput) nameInput.value = activeUserProfile.name;
                if (ageInput) ageInput.value = activeUserProfile.age !== null ? activeUserProfile.age : '';
                if (genderInput) genderInput.value = activeUserProfile.gender;
                if (heightInput) heightInput.value = activeUserProfile.height !== null ? activeUserProfile.height : '';
                if (weightInput) weightInput.value = activeUserProfile.weight !== null ? activeUserProfile.weight : '';

                checkAgeNotice();
            } else {
                // User has an account but has not yet saved a profile row
                activeUserProfile = null;
                resetProfileForm();
            }
        } catch (err) {
            console.error('Unexpected exception loading profile from Supabase:', err);
            activeUserProfile = null;
            resetProfileForm();
        }
    } else {
        // Guest mode fallback
        let guestData = null;
        try {
            const raw = localStorage.getItem('nutritrack_profile_guest');
            if (raw) {
                guestData = JSON.parse(raw);
            }
        } catch (e) {
            console.warn('Error reading guest profile from localStorage:', e);
        }

        if (guestData && typeof guestData === 'object') {
            activeUserProfile = {
                name: guestData.name || '',
                age: guestData.age !== null && guestData.age !== undefined ? Number(guestData.age) : null,
                gender: guestData.gender || '',
                height: guestData.height !== null && guestData.height !== undefined ? Number(guestData.height) : null,
                weight: guestData.weight !== null && guestData.weight !== undefined ? Number(guestData.weight) : null
            };

            const nameInput = document.getElementById('profile-name');
            const ageInput = document.getElementById('profile-age');
            const genderInput = document.getElementById('profile-gender');
            const heightInput = document.getElementById('profile-height');
            const weightInput = document.getElementById('profile-weight');

            if (nameInput) nameInput.value = activeUserProfile.name;
            if (ageInput) ageInput.value = activeUserProfile.age !== null ? activeUserProfile.age : '';
            if (genderInput) genderInput.value = activeUserProfile.gender;
            if (heightInput) heightInput.value = activeUserProfile.height !== null ? activeUserProfile.height : '';
            if (weightInput) weightInput.value = activeUserProfile.weight !== null ? activeUserProfile.weight : '';

            checkAgeNotice();
        } else {
            activeUserProfile = null;
            resetProfileForm();
        }
    }
}

/**
 * Handles profile form submission and persists profile data.
 * - Authenticated users: persists via Supabase public.profiles upsert with session.id.
 * - Guest users: persists to localStorage under 'nutritrack_profile_guest'.
 * @param {Event} event
 */
async function completeProfile(event) {
    event.preventDefault();

    const nameInput = document.getElementById('profile-name');
    const ageInput = document.getElementById('profile-age');
    const genderInput = document.getElementById('profile-gender');
    const heightInput = document.getElementById('profile-height');
    const weightInput = document.getElementById('profile-weight');
    const submitBtn = document.querySelector('#profile-form button[type="submit"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const age = ageInput ? parseInt(ageInput.value, 10) : 0;
    const gender = genderInput ? genderInput.value : '';
    const height = heightInput ? parseFloat(heightInput.value) : 0;
    const weight = weightInput ? parseFloat(weightInput.value) : 0;

    // Validate inputs
    if (!name) {
        alert('Please enter your full name.');
        return;
    }

    if (isNaN(age) || age <= 0 || age > 120) {
        alert('Please enter a valid age.');
        return;
    }

    if (!gender) {
        alert('Please select your gender.');
        return;
    }

    if (isNaN(height) || height <= 0 || height > 300) {
        alert('Please enter a valid height in cm.');
        return;
    }

    if (isNaN(weight) || weight <= 0 || weight > 500) {
        alert('Please enter a valid weight in kg.');
        return;
    }

    checkAgeNotice();

    const session = typeof getAuthSession === 'function' ? getAuthSession() : null;

    if (session && session.id) {
        const client = window.supabaseClient;
        if (!client) {
            alert('Database service is currently unavailable. Please reload the page.');
            return;
        }

        const originalBtnText = submitBtn ? submitBtn.textContent : 'Save Profile';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        }

        try {
            const profilePayload = {
                id: session.id, // Supabase Auth UUID
                name: name,
                age: age,
                gender: gender,
                height: height,
                weight: weight
            };

            const { error } = await client
                .from('profiles')
                .upsert(profilePayload, { onConflict: 'id' });

            if (error) {
                console.error('Error saving profile to Supabase:', error);
                alert('Failed to save profile: ' + (error.message || 'Please check your connection and try again.'));
                return;
            }

            // Only update in-memory state when Supabase confirms success
            activeUserProfile = {
                name: name,
                age: age,
                gender: gender,
                height: height,
                weight: weight
            };

            navigate('home-screen');
        } catch (err) {
            console.error('Unexpected error saving profile to Supabase:', err);
            alert('An unexpected error occurred while saving your profile. Please try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    } else {
        // Guest mode fallback
        const guestData = {
            name: name,
            age: age,
            gender: gender,
            height: height,
            weight: weight,
            updatedAt: new Date().toISOString()
        };

        try {
            localStorage.setItem('nutritrack_profile_guest', JSON.stringify(guestData));
            activeUserProfile = {
                name: name,
                age: age,
                gender: gender,
                height: height,
                weight: weight
            };
        } catch (e) {
            console.error('Error saving guest profile data:', e);
        }

        navigate('home-screen');
    }
}

/**
 * Read-only getter for current profile metrics (in-memory with guest fallback)
 * @returns {{ name: string, age: number, gender: string, height: number, weight: number } | null}
 */
function getProfileMetrics() {
    if (activeUserProfile) {
        return activeUserProfile;
    }
    const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
    if (!session || !session.id) {
        try {
            const raw = localStorage.getItem('nutritrack_profile_guest');
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn('Error reading guest profile metrics:', e);
        }
    }
    return null;
}
