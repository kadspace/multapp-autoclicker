// Game variables
let money = 0;
let clickPower = 1;
let autoClickerLevel = 0;
let autoClickerIntervalId = null;
let currentMathProblem = null;

// Upgrade costs
const clickUpgradeBaseCost = 10;
const autoClickerBaseCost = 50;

// DOM elements
const moneyDisplay = document.getElementById('money');
const clickPowerDisplay = document.getElementById('click-power');
const clickArea = document.getElementById('click-area');
const problemText = document.getElementById('problem-text');
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-answer');
const clickUpgradeCost = document.getElementById('click-upgrade-cost');
const autoUpgradeCost = document.getElementById('auto-upgrade-cost');
const buyButtons = document.querySelectorAll('.buy-button');

// Initialize the game
function initGame() {
    updateMoney(0);
    generateMathProblem();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    clickArea.addEventListener('click', handleClick);
    submitButton.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    buyButtons.forEach(button => {
        button.addEventListener('click', handleUpgrade);
    });
}

// Handle clicking the main click area
function handleClick() {
    updateMoney(money + clickPower);
}

// Update the money display
function updateMoney(amount) {
    money = amount;
    moneyDisplay.textContent = money;
    updateUpgradeButtons();
}

// Generate a new math problem
function generateMathProblem() {
    // Get a random operation (addition, subtraction, multiplication)
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    // Generate numbers based on operation
    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 50) + 26; // Ensure num1 > num2
            num2 = Math.floor(Math.random() * 25) + 1;
            answer = num1 - num2;
            break;
        case '*':
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            answer = num1 * num2;
            break;
    }
    
    currentMathProblem = {
        text: `${num1} ${operation} ${num2} = ?`,
        answer: answer
    };
    
    problemText.textContent = `Solve: ${currentMathProblem.text}`;
    answerInput.value = '';
    answerInput.focus();
}

// Check the submitted answer
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    
    if (isNaN(userAnswer)) {
        alert('Please enter a valid number');
        return;
    }
    
    if (userAnswer === currentMathProblem.answer) {
        // Correct answer
        const bonus = 5;
        updateMoney(money + bonus);
        alert(`Correct! You earned a $${bonus} bonus.`);
        generateMathProblem();
    } else {
        // Wrong answer
        alert('Incorrect answer. Try again!');
    }
}

// Handle buying upgrades
function handleUpgrade(e) {
    const upgradeType = e.target.dataset.upgrade;
    
    if (upgradeType === 'click') {
        const cost = getClickUpgradeCost();
        if (money >= cost) {
            clickPower++;
            updateMoney(money - cost);
            clickPowerDisplay.textContent = clickPower;
            clickUpgradeCost.textContent = getClickUpgradeCost();
        }
    } else if (upgradeType === 'auto') {
        const cost = getAutoClickerCost();
        if (money >= cost) {
            autoClickerLevel++;
            updateMoney(money - cost);
            autoUpgradeCost.textContent = getAutoClickerCost();
            
            // Clear existing interval and set up a new one
            if (autoClickerIntervalId) {
                clearInterval(autoClickerIntervalId);
            }
            
            autoClickerIntervalId = setInterval(() => {
                updateMoney(money + (autoClickerLevel * clickPower));
            }, 1000);
        }
    }
}

// Calculate click upgrade cost
function getClickUpgradeCost() {
    return Math.floor(clickUpgradeBaseCost * Math.pow(1.5, clickPower - 1));
}

// Calculate auto clicker cost
function getAutoClickerCost() {
    return Math.floor(autoClickerBaseCost * Math.pow(2, autoClickerLevel));
}

// Update upgrade buttons based on money
function updateUpgradeButtons() {
    buyButtons.forEach(button => {
        const upgradeType = button.dataset.upgrade;
        let cost;
        
        if (upgradeType === 'click') {
            cost = getClickUpgradeCost();
        } else if (upgradeType === 'auto') {
            cost = getAutoClickerCost();
        }
        
        if (money >= cost) {
            button.disabled = false;
        } else {
            button.disabled = true;
        }
    });
}

// Start the game when the page loads
window.addEventListener('load', initGame); 