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
    } else if (bmi < 25) {
        category = 'Normal';
    } else if (bmi < 30) {
        category = 'Overweight';
    } else {
        category = 'Obese';
    }
    
    if (resultValue) resultValue.textContent = bmiRounded;
    if (resultCategory) resultCategory.textContent = category;
    if (comingSoon) comingSoon.style.display = 'none';
}
