// Since the script is loaded at the bottom of the HTML body, 
// the DOM elements are already available.
// We can directly set the timeout to fade out the splash screen.
setTimeout(() => {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500); // Wait for the 0.5s CSS transition to finish
    }
}, 2500);

/**
 * Handles navigation between different views
 * @param {string} targetViewId - The ID of the view to show
 */
function navigate(targetViewId) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => {
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(targetViewId);
    if (targetView) {
        targetView.classList.add('active');
        window.scrollTo(0, 0);
    } else {
        console.error(`View with ID ${targetViewId} not found.`);
    }
}

/**
 * Calculates BMI based on height (cm) and weight (kg) inputs
 */
function init() {
    loadFoodLog();
    populateFoodSelector();
    renderFoodLog();
    
    // Render dynamic libraries
    renderFoodLibrary('All');
    renderDiabetesGuide();
    renderCholesterolGuide();
    
    // Render Weight Progress
    renderWeightHistory(weightHistory);
    renderWeightProgress(weightHistory);
    updateWeightSummary(weightHistory);
}


// Initialize when script loads
init();
