// Supabase Authentication & Real Session Management
// Integrates official Supabase JavaScript Auth (v2) with NutriTrack BD.
// Uses unique Auth UUID as permanent user identity.

let currentAuthSession = null;
let currentAuthUser = null;

/**
 * Helper to safely access the initialized Supabase Auth client
 * @returns {object|null}
 */
function getSupabaseAuth() {
    if (window.supabaseClient && window.supabaseClient.auth) {
        return window.supabaseClient.auth;
    }
    if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.auth) {
        return supabaseClient.auth;
    }
    return null;
}

/**
 * Retrieves the current authenticated user session
 * @returns {{ id: string, email: string, user: object } | null}
 */
function getAuthSession() {
    if (currentAuthUser && currentAuthUser.id) {
        return {
            id: currentAuthUser.id,
            email: currentAuthUser.email || '',
            user: currentAuthUser
        };
    }
    if (currentAuthSession && currentAuthSession.user) {
        return {
            id: currentAuthSession.user.id,
            email: currentAuthSession.user.email || '',
            user: currentAuthSession.user
        };
    }
    return null;
}

/**
 * Clears any legacy mock session without touching unrelated data
 */
function clearLegacyMockSession() {
    try {
        localStorage.removeItem('nutritrack_mock_session');
    } catch (e) {
        // Ignore
    }
}

/**
 * Cleans any displayed auth error or notice messages
 */
function clearAuthErrors() {
    const loginError = document.getElementById('login-error');
    if (loginError) {
        loginError.style.display = 'none';
        loginError.textContent = '';
        loginError.style.color = '#e53e3e';
    }
    const signupError = document.getElementById('signup-error');
    if (signupError) {
        signupError.style.display = 'none';
        signupError.textContent = '';
        signupError.style.color = '#e53e3e';
    }
}

/**
 * Formats auth errors from Supabase into user-friendly messages
 * @param {Error|object} error
 * @returns {string}
 */
function formatAuthError(error) {
    if (!error || !error.message) {
        return 'An unexpected authentication error occurred. Please try again.';
    }
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid login credentials')) {
        return 'Invalid email or password. Please verify your credentials and try again.';
    }
    if (msg.includes('email not confirmed')) {
        return 'Please confirm your email address before signing in. Check your inbox for the confirmation link.';
    }
    if (msg.includes('user already registered') || msg.includes('already registered')) {
        return 'An account with this email already exists. Please sign in instead.';
    }
    if (msg.includes('password should be at least')) {
        return 'Password must be at least 8 characters.';
    }
    if (msg.includes('failed to fetch') || msg.includes('network')) {
        return 'Network connection error. Please check your internet connection.';
    }
    return error.message;
}

/**
 * Toggles visibility of the account dropdown menu on Home Screen
 */
function toggleAccountMenu() {
    const menu = document.getElementById('account-dropdown-menu');
    if (menu) {
        if (menu.style.display === 'block') {
            menu.style.display = 'none';
        } else {
            updateAuthMenuUI();
            menu.style.display = 'block';
        }
    }
}

// Close account dropdown when clicking anywhere outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('account-dropdown-menu');
    const iconBtn = document.getElementById('account-icon-btn');
    if (menu && menu.style.display === 'block') {
        if (iconBtn && !menu.contains(event.target) && !iconBtn.contains(event.target)) {
            menu.style.display = 'none';
        }
    }
});

/**
 * Dynamically updates the account dropdown menu based on current real auth state
 */
function updateAuthMenuUI() {
    const session = getAuthSession();
    const userInfoEl = document.getElementById('menu-user-info');
    const userEmailEl = document.getElementById('menu-user-email');
    const itemProfile = document.getElementById('menu-item-profile');
    const itemSignIn = document.getElementById('menu-item-signin');
    const itemSignUp = document.getElementById('menu-item-signup');
    const itemLogout = document.getElementById('menu-item-logout');

    if (session && session.email) {
        // Authenticated state
        if (userInfoEl && userEmailEl) {
            userEmailEl.textContent = session.email;
            userInfoEl.style.display = 'flex';
        }
        if (itemProfile) itemProfile.style.display = 'flex';
        if (itemSignIn) itemSignIn.style.display = 'none';
        if (itemSignUp) itemSignUp.style.display = 'none';
        if (itemLogout) itemLogout.style.display = 'flex';
    } else {
        // Guest / Logged-out state
        if (userInfoEl) userInfoEl.style.display = 'none';
        if (itemProfile) itemProfile.style.display = 'flex';
        if (itemSignIn) itemSignIn.style.display = 'flex';
        if (itemSignUp) itemSignUp.style.display = 'flex';
        if (itemLogout) itemLogout.style.display = 'none';
    }
}

/**
 * Handles user logout securely via Supabase Auth
 */
async function handleLogout() {
    const auth = getSupabaseAuth();
    if (auth) {
        try {
            await auth.signOut();
        } catch (err) {
            console.warn('Error during Supabase signOut:', err);
        }
    }
    currentAuthSession = null;
    currentAuthUser = null;
    clearLegacyMockSession();
    updateAuthMenuUI();

    if (typeof resetProfileForm === 'function') {
        resetProfileForm();
    }
    if (typeof loadFoodLog === 'function') await loadFoodLog(null);
    if (typeof renderFoodLog === 'function') renderFoodLog();
    if (typeof renderFoodHistory === 'function') await renderFoodHistory();
    if (typeof loadWeightHistory === 'function') await loadWeightHistory(null);
    navigate('login-screen');
}

/**
 * Routes actions triggered from the account dropdown menu
 * @param {string} action
 */
function handleAccountAction(action) {
    const menu = document.getElementById('account-dropdown-menu');
    if (menu) menu.style.display = 'none';

    if (action === 'logout') {
        handleLogout();
    } else if (action === 'profile-setup') {
        if (typeof loadProfile === 'function') {
            loadProfile();
        }
        navigate('profile-setup');
    } else {
        clearAuthErrors();
        navigate(action);
    }
}

/**
 * Handles real user sign-in via Supabase Auth (signInWithPassword)
 * @param {Event} event
 */
async function initiateLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorMsg = document.getElementById('login-error');
    const submitBtn = document.querySelector('#login-form button[type="submit"]');

    const email = emailInput ? emailInput.value : '';
    const password = passwordInput ? passwordInput.value : '';

    if (errorMsg) {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
        errorMsg.style.color = '#e53e3e';
    }

    // Client-side validations
    if (typeof isValidEmail === 'function' && !isValidEmail(email)) {
        if (errorMsg) {
            errorMsg.textContent = 'Please enter a valid email address.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    if (typeof isValidPassword === 'function' && !isValidPassword(password, 6)) {
        if (errorMsg) {
            errorMsg.textContent = 'Password must be at least 6 characters.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    const auth = getSupabaseAuth();
    if (!auth) {
        if (errorMsg) {
            errorMsg.textContent = 'Authentication service is currently unavailable. Please reload the page.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    const originalBtnText = submitBtn ? submitBtn.textContent : 'Sign In';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing In...';
    }

    try {
        const cleanEmail = email.trim().toLowerCase();
        const { data, error } = await auth.signInWithPassword({
            email: cleanEmail,
            password: password
        });

        if (error) {
            if (errorMsg) {
                errorMsg.textContent = formatAuthError(error);
                errorMsg.style.display = 'block';
            }
            return;
        }

        if (data && data.session && data.user) {
            currentAuthSession = data.session;
            currentAuthUser = data.user;

            clearLegacyMockSession();
            if (passwordInput) passwordInput.value = '';

            updateAuthMenuUI();

            if (typeof loadProfile === 'function') loadProfile();
            if (typeof loadFoodLog === 'function') await loadFoodLog(data.session);
            if (typeof renderFoodLog === 'function') renderFoodLog();
            if (typeof renderFoodHistory === 'function') await renderFoodHistory();
            if (typeof loadWeightHistory === 'function') await loadWeightHistory(data.session);

            navigate('home-screen');
        } else {
            if (errorMsg) {
                errorMsg.textContent = 'Unable to establish an authenticated session. Please try again.';
                errorMsg.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Login error:', err);
        if (errorMsg) {
            errorMsg.textContent = formatAuthError(err);
            errorMsg.style.display = 'block';
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }
}

/**
 * Handles real user registration via Supabase Auth (signUp)
 * @param {Event} event
 */
async function initiateSignUp(event) {
    event.preventDefault();

    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    const errorMsg = document.getElementById('signup-error');
    const submitBtn = document.querySelector('#signup-form button[type="submit"]');

    const email = emailInput ? emailInput.value : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

    if (errorMsg) {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
        errorMsg.style.color = '#e53e3e';
    }

    // Client-side validations
    if (typeof isValidEmail === 'function' && !isValidEmail(email)) {
        if (errorMsg) {
            errorMsg.textContent = 'Please enter a valid email address.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    if (typeof isValidPassword === 'function' && !isValidPassword(password, 8)) {
        if (errorMsg) {
            errorMsg.textContent = 'Password must be at least 8 characters.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    if (typeof passwordsMatch === 'function' && !passwordsMatch(password, confirmPassword)) {
        if (errorMsg) {
            errorMsg.textContent = 'Passwords do not match.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    const auth = getSupabaseAuth();
    if (!auth) {
        if (errorMsg) {
            errorMsg.textContent = 'Authentication service is currently unavailable. Please reload the page.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    const originalBtnText = submitBtn ? submitBtn.textContent : 'Sign Up';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
    }

    try {
        const cleanEmail = email.trim().toLowerCase();
        const { data, error } = await auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) {
            if (errorMsg) {
                errorMsg.style.color = '#e53e3e';
                errorMsg.textContent = formatAuthError(error);
                errorMsg.style.display = 'block';
            }
            return;
        }

        // Check if email confirmation is required (session is null)
        if (data && data.user && !data.session) {
            // Unconfirmed signup: Do NOT treat as active session
            currentAuthSession = null;
            currentAuthUser = null;
            updateAuthMenuUI();

            if (passwordInput) passwordInput.value = '';
            if (confirmPasswordInput) confirmPasswordInput.value = '';

            if (errorMsg) {
                errorMsg.style.color = '#38a169'; // Informational green
                errorMsg.textContent = 'Account created! Please check your email to confirm your account before signing in.';
                errorMsg.style.display = 'block';
            }
            return;
        }

        // Active session established (email confirmation disabled on project)
        if (data && data.session && data.user) {
            currentAuthSession = data.session;
            currentAuthUser = data.user;

            clearLegacyMockSession();
            if (passwordInput) passwordInput.value = '';
            if (confirmPasswordInput) confirmPasswordInput.value = '';

            updateAuthMenuUI();

            if (typeof loadProfile === 'function') loadProfile();
            if (typeof loadFoodLog === 'function') await loadFoodLog(data.session);
            if (typeof renderFoodLog === 'function') renderFoodLog();
            if (typeof renderFoodHistory === 'function') await renderFoodHistory();
            if (typeof loadWeightHistory === 'function') await loadWeightHistory(data.session);

            navigate('profile-setup');
        } else {
            if (errorMsg) {
                errorMsg.style.color = '#e53e3e';
                errorMsg.textContent = 'Sign up completed, but no active session was returned. Please try signing in.';
                errorMsg.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Sign up error:', err);
        if (errorMsg) {
            errorMsg.style.color = '#e53e3e';
            errorMsg.textContent = formatAuthError(err);
            errorMsg.style.display = 'block';
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }
}

/**
 * Toggles password field masking between password and plain text
 * @param {string} inputId
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

/**
 * Initializes Supabase Auth state, restores existing session, and listens for auth changes
 */
async function initAuth() {
    clearLegacyMockSession();
    const auth = getSupabaseAuth();
    if (!auth) {
        console.warn('Supabase client not ready for auth initialization.');
        return;
    }

    try {
        const { data, error } = await auth.getSession();
        if (error) {
            console.warn('Supabase getSession error:', error);
        } else if (data && data.session && data.session.user) {
            currentAuthSession = data.session;
            currentAuthUser = data.session.user;
            if (typeof loadProfile === 'function') loadProfile();
            if (typeof loadFoodLog === 'function') await loadFoodLog(data.session);
            if (typeof renderFoodLog === 'function') renderFoodLog();
            if (typeof renderFoodHistory === 'function') await renderFoodHistory();
            if (typeof loadWeightHistory === 'function') await loadWeightHistory(data.session);
        } else {
            currentAuthSession = null;
            currentAuthUser = null;
            if (typeof loadFoodLog === 'function') await loadFoodLog(null);
            if (typeof renderFoodLog === 'function') renderFoodLog();
            if (typeof renderFoodHistory === 'function') await renderFoodHistory();
            if (typeof loadWeightHistory === 'function') await loadWeightHistory(null);
        }
    } catch (e) {
        console.warn('Exception restoring auth session:', e);
    }

    updateAuthMenuUI();

    // Listen to real-time auth state changes
    try {
        auth.onAuthStateChange(async (event, session) => {
            if (session && session.user) {
                currentAuthSession = session;
                currentAuthUser = session.user;
            } else {
                currentAuthSession = null;
                currentAuthUser = null;
            }
            updateAuthMenuUI();

            if (typeof loadProfile === 'function') loadProfile();
            if (typeof loadFoodLog === 'function') await loadFoodLog(session || null);
            if (typeof renderFoodLog === 'function') renderFoodLog();
            if (typeof renderFoodHistory === 'function') await renderFoodHistory();
            if (typeof loadWeightHistory === 'function') await loadWeightHistory(session || null);
        });
    } catch (e) {
        console.warn('Error attaching auth state change listener:', e);
    }
}

// Automatically initialize auth when script loads
if (typeof window !== 'undefined') {
    initAuth();
}
