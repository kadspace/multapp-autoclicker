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
let clickingEnabled = false; // Start with clicking disabled
let clickCounter = 0;
let clicksPerSecond = 0;
let clickTrackingInterval = null;
let isInputFocused = false; // Track if an input is focused

// Reward values
const problemRewards = {
    easy: 5,
    medium: 15,
    hard: 30
};

// Upgrade costs
const clickUpgradeBaseCost = 10;
const autoClickerBaseCost = 50;

// DOM elements
const moneyDisplay = document.getElementById('money');
const clickPowerDisplay = document.getElementById('click-power');
const clickArea = document.getElementById('click-area');
const submitButtons = document.querySelectorAll('.submit-answer');
const buyButtons = document.querySelectorAll('.buy-button');
const cpsDisplay = document.getElementById('clicks-per-second');
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
    updateClickAreaState();
}

// Setup event listeners
function setupEventListeners() {
    // Click area
    clickArea.addEventListener('click', handleClick);
    
    // Submit buttons
    submitButtons.forEach(button => {
        button.addEventListener('click', () => {
            const difficulty = button.dataset.difficulty;
            checkAnswer(difficulty);
        });
    });
    
    // Input fields
    Object.keys(problemElements).forEach(difficulty => {
        // Enter key for submitting answers
        problemElements[difficulty].input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkAnswer(difficulty);
            }
        });
        
        // Track focus state for all input fields
        problemElements[difficulty].input.addEventListener('focus', () => {
            isInputFocused = true;
        });
        
        problemElements[difficulty].input.addEventListener('blur', () => {
            isInputFocused = false;
        });
    });
    
    // Global keydown event for spacebar
    document.addEventListener('keydown', (e) => {
        // If spacebar is pressed and no input is focused, trigger click
        if (e.code === 'Space' && !isInputFocused) {
            e.preventDefault(); // Prevent page scroll
            handleClick();
            
            // Add visual feedback for the click area
            if (clickingEnabled) {
                clickArea.classList.add('active');
                setTimeout(() => {
                    clickArea.classList.remove('active');
                }, 100);
            }
        }
    });
    
    // Upgrade buttons
    buyButtons.forEach(button => {
        button.addEventListener('click', handleUpgrade);
    });
}

// Handle clicking the main click area
function handleClick() {
    if (clickingEnabled) {
        updateMoney(money + clickPower);
        clickCounter++;
    } else {
        showNotification('Solve at least one math problem to unlock clicking!', 'error');
    }
}

// Update the click area appearance based on whether clicking is enabled
function updateClickAreaState() {
    if (clickingEnabled) {
        clickArea.classList.remove('disabled');
        clickArea.querySelector('.click-text').textContent = 'CLICK';
    } else {
        clickArea.classList.add('disabled');
        clickArea.querySelector('.click-text').textContent = 'LOCKED';
    }
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

// Check the submitted answer for a specific difficulty
function checkAnswer(difficulty) {
    const userAnswer = parseInt(problemElements[difficulty].input.value);
    
    if (isNaN(userAnswer)) {
        showNotification('Please enter a valid number', 'error');
        return;
    }
    
    if (userAnswer === currentMathProblems[difficulty].answer) {
        // Correct answer
        const reward = problemRewards[difficulty];
        updateMoney(money + reward);
        
        // Enable clicking if it wasn't already enabled
        if (!clickingEnabled) {
            clickingEnabled = true;
            updateClickAreaState();
            showNotification('Clicking unlocked! You can now click to earn money!', 'success');
        } else {
            showNotification(`Correct! You earned $${reward}!`, 'success');
        }
        
        generateMathProblem(difficulty);
    } else {
        // Wrong answer
        showNotification('Incorrect answer. Try again!', 'error');
    }
}

// Show a temporary notification instead of an alert
function showNotification(message, type) {
    // Check if a notification container exists, if not, create one
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            }
            .notification {
                background-color: white;
                padding: 12px 20px;
                margin-bottom: 10px;
                border-radius: 4px;
                box-shadow: 0 3px 6px rgba(0,0,0,0.16);
                transform: translateX(120%);
                transition: transform 0.3s ease-out;
                display: flex;
                align-items: center;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification.success {
                border-left: 4px solid #4caf50;
            }
            .notification.error {
                border-left: 4px solid #f44336;
            }
            .click-area.active {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
                if (clickingEnabled) { // Only auto-click if clicking is enabled
                    updateMoney(money + (autoClickerLevel * clickPower));
                }
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