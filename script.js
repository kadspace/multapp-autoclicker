// Game variables
let money = 0;
let clickPower = 1;
let autoClickerLevel = 0;
let autoClickerIntervalId = null;
let currentMathProblems = {
    easy: null,
    medium: null,
    hard: null
};
let clickCounter = 0;
let clicksPerSecond = 0;
let clickTrackingInterval = null;
let activeMultiplier = 1;
let multiplierTimeout = null;
let hasClickedOnce = false;

// Reward values (these are now multipliers to add)
const problemMultipliers = {
    easy: 2,
    medium: 3,
    hard: 5
};

// Multiplier duration in milliseconds
const MULTIPLIER_DURATION = 5000;

// Upgrade costs
const clickUpgradeBaseCost = 10;
const autoClickerBaseCost = 50;

// DOM elements
const moneyDisplay = document.getElementById('money');
const clickPowerDisplay = document.getElementById('click-power');
const submitButtons = document.querySelectorAll('.submit-answer');
const buyButtons = document.querySelectorAll('.buy-button');
const cpsDisplay = document.getElementById('clicks-per-second');
const multiplierDisplay = document.getElementById('current-multiplier');
const spacebarInstruction = document.getElementById('spacebar-instruction');
const inputFields = document.querySelectorAll('input');

// Problem elements by difficulty
const problemElements = {
    easy: {
        text: document.getElementById('easy-problem-text'),
        input: document.getElementById('easy-answer-input')
    },
    medium: {
        text: document.getElementById('medium-problem-text'),
        input: document.getElementById('medium-answer-input')
    },
    hard: {
        text: document.getElementById('hard-problem-text'),
        input: document.getElementById('hard-answer-input')
    }
};

// Initialize the game
function initGame() {
    updateMoney(0);
    generateAllMathProblems();
    setupEventListeners();
    startClickTracking();
    updateMultiplierDisplay();
}

// Setup event listeners
function setupEventListeners() {
    // Submit buttons - keep these as a fallback
    submitButtons.forEach(button => {
        button.addEventListener('click', () => {
            const difficulty = button.dataset.difficulty;
            checkAnswer(difficulty);
        });
    });
    
    // Input fields - check answer on input
    Object.keys(problemElements).forEach(difficulty => {
        // Auto-check answer as user types
        problemElements[difficulty].input.addEventListener('input', () => {
            // Only check if there's a value
            if (problemElements[difficulty].input.value.trim() !== '') {
                checkAnswer(difficulty);
            }
        });
        
        // Also keep Enter key functionality as a fallback
        problemElements[difficulty].input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkAnswer(difficulty);
            }
        });
    });
    
    // Global keydown event for spacebar
    document.addEventListener('keydown', (e) => {
        // If spacebar is pressed, trigger a click
        if (e.code === 'Space') {
            // Always prevent default behavior of spacebar (page scrolling, etc.)
            e.preventDefault();
            
            // If spacebar is pressed in an input, don't add the space character
            if (document.activeElement.tagName === 'INPUT') {
                // Get current input value and cursor position
                const input = document.activeElement;
                const cursorPosition = input.selectionStart;
                const value = input.value;
                
                // Restore the value without the space
                // This effectively cancels the default spacebar behavior
                setTimeout(() => {
                    input.value = value;
                    input.setSelectionRange(cursorPosition, cursorPosition);
                }, 0);
            }
            
            // Trigger the click
            handleClick();
            
            // Hide the spacebar instruction after first press
            if (!hasClickedOnce) {
                hideSpacebarInstruction();
                hasClickedOnce = true;
            }
        }
    });
    
    // Upgrade buttons
    buyButtons.forEach(button => {
        button.addEventListener('click', handleUpgrade);
    });
}

// Hide the spacebar instruction
function hideSpacebarInstruction() {
    spacebarInstruction.classList.add('hidden');
}

// Handle clicking (spacebar press)
function handleClick() {
    const totalClickValue = clickPower * activeMultiplier;
    updateMoney(money + totalClickValue);
    clickCounter++;
    
    // Add visual feedback to the multiplier
    const multiplierElement = document.querySelector('.multiplier');
    multiplierElement.classList.add('active');
    setTimeout(() => {
        multiplierElement.classList.remove('active');
    }, 100);
}

// Start tracking clicks per second
function startClickTracking() {
    clickTrackingInterval = setInterval(() => {
        clicksPerSecond = clickCounter;
        clickCounter = 0;
        cpsDisplay.textContent = clicksPerSecond;
    }, 1000);
}

// Update the money display
function updateMoney(amount) {
    money = amount;
    moneyDisplay.textContent = money;
    updateUpgradeButtons();
}

// Generate math problems for all difficulty levels
function generateAllMathProblems() {
    generateMathProblem('easy');
    generateMathProblem('medium');
    generateMathProblem('hard');
}

// Generate a math problem based on difficulty - only multiplication now
function generateMathProblem(difficulty) {
    let num1, num2, answer, problemText;
    
    switch (difficulty) {
        case 'easy':
            // Easy multiplication (1-5)
            num1 = Math.floor(Math.random() * 5) + 1; // 1-5
            num2 = Math.floor(Math.random() * 5) + 1; // 1-5
            answer = num1 * num2;
            problemText = `${num1} × ${num2} = ?`;
            break;
            
        case 'medium':
            // Medium multiplication (5-9)
            num1 = Math.floor(Math.random() * 5) + 5; // 5-9
            num2 = Math.floor(Math.random() * 5) + 5; // 5-9
            answer = num1 * num2;
            problemText = `${num1} × ${num2} = ?`;
            break;
            
        case 'hard':
            // Hard multiplication (double digits)
            num1 = Math.floor(Math.random() * 90) + 10; // 10-99
            num2 = Math.floor(Math.random() * 90) + 10; // 10-99
            answer = num1 * num2;
            problemText = `${num1} × ${num2} = ?`;
            break;
    }
    
    currentMathProblems[difficulty] = {
        text: problemText,
        answer: answer
    };
    
    problemElements[difficulty].text.textContent = `Solve: ${problemText}`;
    problemElements[difficulty].input.value = '';
}

// Apply multiplier for correct answers
function applyMultiplier(multiplier) {
    // Clear any existing multiplier timeout
    if (multiplierTimeout) {
        clearTimeout(multiplierTimeout);
    }
    
    // Add the new multiplier to the current one
    activeMultiplier += multiplier;
    
    // Update the display
    updateMultiplierDisplay();
    
    // Set timeout to reset multiplier
    multiplierTimeout = setTimeout(() => {
        activeMultiplier = 1;
        updateMultiplierDisplay();
    }, MULTIPLIER_DURATION);
}

// Update multiplier display
function updateMultiplierDisplay() {
    multiplierDisplay.textContent = activeMultiplier;
}

// Check the submitted answer for a specific difficulty
function checkAnswer(difficulty) {
    const userAnswer = parseInt(problemElements[difficulty].input.value);
    
    if (isNaN(userAnswer)) {
        return;
    }
    
    if (userAnswer === currentMathProblems[difficulty].answer) {
        // Apply the multiplier for correct answer
        applyMultiplier(problemMultipliers[difficulty]);
        
        // Generate a new problem
        generateMathProblem(difficulty);
    } else {
        // Wrong answer - visual feedback only
        const inputField = problemElements[difficulty].input;
        inputField.classList.add('incorrect');
        
        setTimeout(() => {
            inputField.classList.remove('incorrect');
        }, 500);
    }
}

// Handle auto clicker upgrades
function handleUpgrade(e) {
    const upgradeType = e.target.dataset.upgrade;
    
    if (upgradeType === 'click') {
        const cost = getClickUpgradeCost();
        if (money >= cost) {
            clickPower++;
            updateMoney(money - cost);
            clickPowerDisplay.textContent = clickPower;
            document.getElementById('click-upgrade-cost').textContent = getClickUpgradeCost();
        }
    } else if (upgradeType === 'auto') {
        const cost = getAutoClickerCost();
        if (money >= cost) {
            autoClickerLevel++;
            updateMoney(money - cost);
            document.getElementById('auto-upgrade-cost').textContent = getAutoClickerCost();
            
            // Clear existing interval and set up a new one
            if (autoClickerIntervalId) {
                clearInterval(autoClickerIntervalId);
            }
            
            autoClickerIntervalId = setInterval(() => {
                updateMoney(money + (autoClickerLevel * clickPower * activeMultiplier));
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