function calculateBMI() {
    const heightInput = document.getElementById('bmi-height');
    const weightInput = document.getElementById('bmi-weight');
    const resultValue = document.getElementById('bmi-result-value');
    const resultCategory = document.getElementById('bmi-result-category');
    const errorMsg = document.getElementById('bmi-error');
    const comingSoon = document.getElementById('bmi-coming-soon');
    
    if (errorMsg) {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
    }
    
    const heightCm = parseFloat(heightInput.value);
    const weightKg = parseFloat(weightInput.value);
    
    if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0) {
        if (errorMsg) {
            errorMsg.textContent = 'Please enter valid positive numbers for both height and weight.';
            errorMsg.style.display = 'block';
        }
        return;
    }
    
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = bmi.toFixed(1);
    
    let category = '';
    if (bmi < 18.5) {
        category = 'Underweight';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        category = 'Normal';
    } else if (bmi >= 25 && bmi <= 29.9) {
        category = 'Overweight';
    } else {
        category = 'Obese';
    }
    
    if (resultValue) resultValue.textContent = bmiRounded;
    if (resultCategory) resultCategory.textContent = category;
    if (comingSoon) comingSoon.style.display = 'none';
}

/**
 * Calculates BMR based on Mifflin-St Jeor equation
 */
function calculateBMR() {
    const ageInput = document.getElementById('bmr-age');
    const genderInput = document.getElementById('bmr-gender');
    const heightInput = document.getElementById('bmr-height');
    const weightInput = document.getElementById('bmr-weight');
    const resultValue = document.getElementById('bmr-result-value');
    const errorMsg = document.getElementById('bmr-error');
    const comingSoon = document.getElementById('bmr-coming-soon');
    
    if (errorMsg) {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
    }
    
    const age = parseInt(ageInput.value, 10);
    const heightCm = parseFloat(heightInput.value);
    const weightKg = parseFloat(weightInput.value);
    const gender = genderInput.value;
    
    if (isNaN(age) || isNaN(heightCm) || isNaN(weightKg) || age <= 0 || heightCm <= 0 || weightKg <= 0) {
        if (errorMsg) {
            errorMsg.textContent = 'Please enter valid positive numbers for age, height, and weight.';
            errorMsg.style.display = 'block';
        }
        return;
    }
    
    let bmr = 0;
    if (gender === 'male') {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
    
    if (resultValue) {
        resultValue.innerHTML = `${Math.round(bmr)} <span>kcal</span>`;
    }
    if (comingSoon) comingSoon.style.display = 'none';
}

// --- Food Database ---
