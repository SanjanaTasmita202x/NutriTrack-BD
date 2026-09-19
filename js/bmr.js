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

function getRawBMR() {
    const age = parseInt(document.getElementById('bmr-age').value, 10);
    const heightCm = parseFloat(document.getElementById('bmr-height').value);
    const weightKg = parseFloat(document.getElementById('bmr-weight').value);
    const gender = document.getElementById('bmr-gender').value;
    
    if (isNaN(age) || isNaN(heightCm) || isNaN(weightKg) || age <= 0 || heightCm <= 0 || weightKg <= 0) {
        return null;
    }
    
    let bmr = 0;
    if (gender === 'male') {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
    return bmr;
}

function calculateGoal() {
    const goalErrorMsg = document.getElementById('bmr-goal-error');
    const resultCard = document.getElementById('goal-result-card');
    const goalAssessmentText = document.getElementById('goal-assessment-text');
    const goalCaloriesText = document.getElementById('goal-calories-text');
    const goalProgressText = document.getElementById('goal-progress-text');
    const maintenanceResult = document.getElementById('bmr-maintenance-result');
    
    if (goalErrorMsg) {
        goalErrorMsg.style.display = 'none';
        goalErrorMsg.textContent = '';
    }
    
    const bmr = getRawBMR();
    if (bmr === null) {
        if (goalErrorMsg) {
            goalErrorMsg.textContent = 'Please calculate a valid BMR first by entering age, height, and weight.';
            goalErrorMsg.style.display = 'block';
        }
        return;
    }
    
    const activityMultiplier = parseFloat(document.getElementById('bmr-activity').value);
    const tdee = Math.round(bmr * activityMultiplier);
    
    if (maintenanceResult) {
        maintenanceResult.innerHTML = `${tdee} <span>kcal/day</span>`;
    }
    
    const age = parseInt(document.getElementById('bmr-age').value, 10);
    const currentWeight = parseFloat(document.getElementById('bmr-weight').value);
    const targetWeightInput = document.getElementById('bmr-target-weight').value;
    const goal = document.getElementById('bmr-goal').value;
    
    let targetWeight = parseFloat(targetWeightInput);
    if (isNaN(targetWeight) || targetWeight <= 0) {
        if (goal !== 'maintain' || targetWeightInput.trim() !== '') {
             if (goal === 'maintain' && targetWeightInput.trim() === '') {
                 targetWeight = currentWeight;
             } else {
                 if (goalErrorMsg) {
                     goalErrorMsg.textContent = 'Please enter a valid target weight.';
                     goalErrorMsg.style.display = 'block';
                 }
                 return;
             }
        }
    }
    
    if (goal === 'lose' && targetWeight >= currentWeight) {
        if (goalErrorMsg) {
            goalErrorMsg.textContent = 'For weight loss, your target weight should be lower than your current weight.';
            goalErrorMsg.style.display = 'block';
        }
        return;
    }
    if (goal === 'gain' && targetWeight <= currentWeight) {
        if (goalErrorMsg) {
            goalErrorMsg.textContent = 'For weight gain, your target weight should be higher than your current weight.';
            goalErrorMsg.style.display = 'block';
        }
        return;
    }
    if (goal === 'maintain' && targetWeight !== currentWeight) {
         if (goalErrorMsg) {
             goalErrorMsg.textContent = 'To maintain weight, your target weight should match your current weight.';
             goalErrorMsg.style.display = 'block';
         }
         return;
    }

    if (resultCard) {
        resultCard.style.display = 'block';
    }

    if (age < 18) {
        goalAssessmentText.textContent = "Calorie and weight goals for people under 18 are different because the body is still growing. Please discuss weight changes with a qualified healthcare professional.";
        goalCaloriesText.textContent = "--";
        goalProgressText.textContent = "--";
        return;
    }

    const heightCm = parseFloat(document.getElementById('bmr-height').value);
    const heightM = heightCm / 100;
    const targetBmi = targetWeight / (heightM * heightM);
    
    if (targetBmi < 18.5) {
        goalAssessmentText.textContent = "This target may not be appropriate based on the information provided. The target weight results in a BMI below the commonly used healthy range. Consider discussing your weight goal with a qualified healthcare professional.";
    } else if (targetBmi >= 18.5 && targetBmi <= 24.9) {
        goalAssessmentText.textContent = "Your target appears reasonable based on the information provided.";
    } else if (targetBmi >= 25 && targetBmi <= 29.9) {
        goalAssessmentText.textContent = "Your target is above the commonly used healthy BMI range. Consider discussing your weight goal with a qualified healthcare professional.";
    } else {
        goalAssessmentText.textContent = "This target may not be appropriate based on the information provided. Consider discussing your weight goal with a qualified healthcare professional.";
    }
    
    if (goal === 'lose') {
        const lower = tdee - 500;
        const upper = tdee - 300;
        goalCaloriesText.textContent = `${lower}–${upper} kcal/day`;
        goalProgressText.textContent = "About 0.25–0.5 kg/week";
    } else if (goal === 'gain') {
        const lower = tdee + 200;
        const upper = tdee + 300;
        goalCaloriesText.textContent = `${lower}–${upper} kcal/day`;
        goalProgressText.textContent = "About 0.2–0.3 kg/week";
    } else {
        goalCaloriesText.textContent = `${tdee} kcal/day`;
        goalProgressText.textContent = "Weight maintenance";
    }
}
