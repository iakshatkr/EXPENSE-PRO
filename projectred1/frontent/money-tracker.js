// Global variables to store income and expenses
let incomeItems = [];
let expenseItems = [];

// DOM elements
const totalIncomeElement = document.getElementById('total-income');
const totalExpensesElement = document.getElementById('total-expenses');
const remainingBalanceElement = document.getElementById('remaining-balance');
const incomeListElement = document.getElementById('income-list');
const expenseListElement = document.getElementById('expense-list');
const recommendationsContainer = document.getElementById('recommendations-container');
const clearDataButton = document.getElementById('clear-data');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateSummary();
    updateIncomeList();
    updateExpenseList();
    generateRecommendations();

    // Dark Mode Toggle
    document.getElementById('theme-toggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });

    // Clear All Data
    clearDataButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            incomeItems = [];
            expenseItems = [];
            saveData();
            updateIncomeList();
            updateExpenseList();
            updateSummary();
            recommendationsContainer.innerHTML = '<p>No expenses to analyze yet. Add some expenses to get recommendations.</p>';
        }
    });
});

// Load data from localStorage
function loadData() {
    const savedIncome = localStorage.getItem('incomeItems');
    const savedExpenses = localStorage.getItem('expenseItems');
    incomeItems = savedIncome ? JSON.parse(savedIncome) : [];
    expenseItems = savedExpenses ? JSON.parse(savedExpenses) : [];
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('incomeItems', JSON.stringify(incomeItems));
    localStorage.setItem('expenseItems', JSON.stringify(expenseItems));
}

// Add Income
function addIncome() {
    const amountInput = document.getElementById('income-amount');
    const descriptionInput = document.getElementById('income-description');
    
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value;
    
    if (isNaN(amount) || amount <= 0 || !description) {
        alert('Please enter a valid amount and description');
        return;
    }
    
    const incomeItem = {
        id: Date.now(),
        amount,
        description,
        date: new Date().toISOString()
    };
    
    incomeItems.push(incomeItem);
    saveData();
    updateIncomeList();
    updateSummary();
    
    // Clear inputs
    amountInput.value = '';
    descriptionInput.value = '';
}

// Add Expense
function addExpense() {
    const amountInput = document.getElementById('expense-amount');
    const descriptionInput = document.getElementById('expense-description');
    const categoryInput = document.getElementById('expense-category');
    
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value;
    const category = categoryInput.value;
    
    if (isNaN(amount) || amount <= 0 || !description) {
        alert('Please enter a valid amount and description');
        return;
    }
    
    const expenseItem = {
        id: Date.now(),
        amount,
        description,
        category,
        date: new Date().toISOString()
    };
    
    expenseItems.push(expenseItem);
    saveData();
    updateExpenseList();
    updateSummary();
    generateRecommendations();
    
    // Clear inputs
    amountInput.value = '';
    descriptionInput.value = '';
    categoryInput.value = 'food';
}

// Update Income List
function updateIncomeList() {
    incomeListElement.innerHTML = '';
    
    incomeItems.slice().reverse().forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div class="transaction-icon income-icon"><i class="fas fa-money-bill-wave"></i></div>
                <div>
                    <strong class="income-amount">₹${item.amount.toFixed(2)}</strong> - ${item.description}
                    <div style="font-size: 12px; color: #888;">${new Date(item.date).toLocaleDateString()}</div>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteIncome(${item.id}); event.stopPropagation();"><i class="fas fa-trash-alt"></i></button>
        `;
        incomeListElement.appendChild(li);
    });
}

// Update Expense List
function updateExpenseList() {
    expenseListElement.innerHTML = '';
    
    expenseItems.slice().reverse().forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div class="transaction-icon ${item.category}">${getCategoryIcon(item.category)}</div>
                <div>
                    <strong class="expense-amount">₹${item.amount.toFixed(2)}</strong> - ${item.description} (${item.category})
                    <div style="font-size: 12px; color: #888;">${new Date(item.date).toLocaleDateString()}</div>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteExpense(${item.id}); event.stopPropagation();"><i class="fas fa-trash-alt"></i></button>
        `;
        expenseListElement.appendChild(li);
    });
}

// Get Category Icon
function getCategoryIcon(category) {
    switch(category) {
        case 'food': return '<i class="fas fa-utensils"></i>';
        case 'entertainment': return '<i class="fas fa-tv"></i>';
        case 'shopping': return '<i class="fas fa-shopping-bag"></i>';
        case 'utilities': return '<i class="fas fa-lightbulb"></i>';
        case 'transportation': return '<i class="fas fa-car-side"></i>';
        default: return '<i class="fas fa-ellipsis-h"></i>';
    }
}

// Update Summary
function updateSummary() {
    const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const remainingBalance = totalIncome - totalExpenses;
    
    totalIncomeElement.textContent = `₹${totalIncome.toFixed(2)}`;
    totalExpensesElement.textContent = `₹${totalExpenses.toFixed(2)}`;
    remainingBalanceElement.textContent = `₹${remainingBalance.toFixed(2)}`;
    
    // Change balance color based on value
    if (remainingBalance < 0) {
        remainingBalanceElement.style.color = '#e74c3c';
    } else {
        remainingBalanceElement.style.color = '#27ae60';
    }
}

// Delete Income
function deleteIncome(id) {
    if (confirm('Are you sure you want to delete this income entry?')) {
        incomeItems = incomeItems.filter(item => item.id !== id);
        saveData();
        updateIncomeList();
        updateSummary();
    }
}

// Delete Expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense entry?')) {
        expenseItems = expenseItems.filter(item => item.id !== id);
        saveData();
        updateExpenseList();
        updateSummary();
        generateRecommendations();
    }
}

// Generate Recommendations
function generateRecommendations() {
    recommendationsContainer.innerHTML = '';
    
    if (expenseItems.length === 0) {
        recommendationsContainer.innerHTML = '<p>No expenses to analyze yet. Add some expenses to get recommendations.</p>';
        return;
    }
    
    // Analyze spending patterns
    const categoryTotals = {};
    expenseItems.forEach(item => {
        if (!categoryTotals[item.category]) {
            categoryTotals[item.category] = 0;
        }
        categoryTotals[item.category] += item.amount;
    });
    
    const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const categoryPercentages = {};
    
    for (const category in categoryTotals) {
        categoryPercentages[category] = (categoryTotals[category] / totalExpenses) * 100;
    }
    
    let recommendations = [];
    
    // Check for high spending categories
    for (const category in categoryPercentages) {
        if (categoryPercentages[category] > 20) {
            recommendations.push(`You're spending a lot on ${category} (${Math.round(categoryPercentages[category])}% of total). Consider reducing this to save money.`);
        }
    }
    
    // Check for common overspending areas with dynamic thresholds
    if (categoryTotals['food'] && categoryTotals['food'] > 5000) {
        recommendations.push('Your food expenses are high. Consider meal planning or cooking at home more often.');
    }
    
    if (categoryTotals['shopping'] && categoryTotals['shopping'] > 3000) {
        recommendations.push('Your shopping expenses are significant. Try creating a shopping list before going to the store.');
    }
    
    if (categoryTotals['entertainment'] && categoryTotals['entertainment'] > 2000) {
        recommendations.push('You might be spending quite a bit on entertainment. Look for free or low-cost alternatives.');
    }
    
    if (categoryTotals['transportation'] && categoryTotals['transportation'] > 4000) {
        recommendations.push('Your transportation costs are high. Consider carpooling or using public transportation.');
    }
    
    if (categoryTotals['utilities'] && categoryTotals['utilities'] > 3000) {
        recommendations.push('Your utility expenses are notable. Look for energy-saving options or reduce usage where possible.');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Your spending looks healthy! Keep up the good work with your financial management.');
    }
    
    // Display recommendations
    recommendations.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <span class="suggestion-icon"><i class="fas fa-lightbulb"></i></span>
            <span>${rec}</span>
        `;
        recommendationsContainer.appendChild(div);
    });
}