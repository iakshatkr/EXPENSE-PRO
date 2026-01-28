    // Global variables
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let expensesChart, categoryChart;

    // DOM elements // learn thiss
    const totalExpensesElement = document.querySelector('.stat-card.blue .stat-value'); // query selection for total expenses
    const totalIncomeElement = document.querySelector('.stat-card.green .stat-value'); // query selection for total income

    const balanceElement = document.querySelector('.stat-card.orange .stat-value');
    const transactionList = document.querySelector('.transaction-list');
    const themeToggle = document.getElementById('theme-toggle');

    // Initialize the app
    window.onload = function() { 
        updateDashboard();
        initializeCharts(); 

        // Form submission for adding expenses
        document.getElementById('expense-form').addEventListener('submit', function(e) {
            e.preventDefault();
            addExpenseFromDashboard();
        });

        // Dark mode toggle
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            updateChartColors();
        });
    };

    // Update Dashboard 
    function updateDashboard() {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
        const balance = totalIncome - totalExpenses;
        
        totalExpensesElement.textContent = `₹${totalExpenses.toFixed(2)}`;
        totalIncomeElement.textContent = `₹${totalIncome.toFixed(2)}`;
        balanceElement.textContent = `₹${balance.toFixed(2)}`;
        
        // Update recent transactions
        transactionList.innerHTML = '';
        const recentTransactions = transactions.slice().reverse().slice(0, 5); // Last 5 transactions
        recentTransactions.forEach(item => {
            const div = document.createElement('div');
            div.className = 'transaction-item';
            const iconClass = item.type === 'income' ? 'income' : item.category.toLowerCase();
            const amountClass = item.type === 'income' ? 'income' : 'expense';
            const sign = item.type === 'income' ? '+' : '-';
            div.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-category ${iconClass}">${getCategoryIcon(item.category)}</div>
                    <div>
                        <div>${item.description}</div>
                        <small>${new Date(item.date).toLocaleDateString()}</small>
                    </div>
                </div>
                <div class="transaction-amount ${amountClass}">${sign}₹${item.amount.toFixed(2)}</div>
            `;
            transactionList.appendChild(div);
        });
    }

    // Initialize Charts
    function initializeCharts() {
        // Expenses Chart (Line Chart for Trends)
        const expensesCtx = document.getElementById('expenses-chart').getContext('2d');
        expensesChart = new Chart(expensesCtx, {
            type: 'line',
            data: {
                labels: getLastSixMonths(),
                datasets: [{
                    label: 'Expenses',
                    data: getExpenseDataForLastSixMonths(),
                    backgroundColor: 'rgba(91, 33, 182, 0.2)',
                    borderColor: 'rgba(91, 33, 182, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: true, mode: 'index' } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { color: '#2d3748' } },
                    x: { grid: { display: false }, ticks: { color: '#2d3748' } }
                },
                animation: { duration: 1500, easing: 'easeInOutQuad' }
            }
        });

        // Category Chart (Doughnut for Breakdown)
        const categoryCtx = document.getElementById('category-chart').getContext('2d');
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: getCategoryBreakdownData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: '#2d3748' } },
                    tooltip: { enabled: true }
                },
                animation: { duration: 1500, easing: 'easeInOutQuad' }
            }
        });
    }

    // Get Last 6 Months for Expense Chart
    function getLastSixMonths() {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
        }
        return months;
    }

    // Get Expense Data for Last 6 Months
    function getExpenseDataForLastSixMonths() {
        const now = new Date();
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthlyExpenses = transactions
                .filter(t => t.type === 'expense')
                .filter(t => {
                    const date = new Date(t.date);
                    return date >= monthStart && date <= monthEnd;
                })
                .reduce((sum, t) => sum + t.amount, 0);
            data.push(monthlyExpenses);
        }
        return data;
    }

    // Get Category Breakdown Data
    function getCategoryBreakdownData() {
        const categoryTotals = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                if (!categoryTotals[t.category]) {
                    categoryTotals[t.category] = 0;
                }
                categoryTotals[t.category] += t.amount;
            });
        return {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                borderWidth: 0
            }]
        };
    }

    // Update Chart Colors for Dark Mode
    function updateChartColors() {
        const isDark = document.body.classList.contains('dark-mode');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        const tickColor = isDark ? '#e2e8f0' : '#2d3748';
        
        expensesChart.options.scales.y.grid.color = gridColor;
        expensesChart.options.scales.x.grid.color = gridColor;
        expensesChart.options.scales.y.ticks.color = tickColor;
        expensesChart.options.scales.x.ticks.color = tickColor;
        categoryChart.options.plugins.legend.labels.color = tickColor;
        
        expensesChart.update();
        categoryChart.update();
    }

    // Add Expense from Dashboard
    function addExpenseFromDashboard() {
        const amountInput = document.getElementById('amount');
        const descriptionInput = document.getElementById('description');
        const categoryInput = document.getElementById('category');
        
        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value;
        const category = categoryInput.value;
        
        if (isNaN(amount) || amount <= 0 || !description || !category) {
            alert('Please enter valid details for the expense.');
            return;
        }
        
        const expenseItem = {
            id: Date.now(),
            type: 'expense',
            category,
            amount,
            description,
            date: new Date().toISOString()
        };
        
        transactions.push(expenseItem);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateDashboard();
        // Update charts
        expensesChart.data.labels = getLastSixMonths();
        expensesChart.data.datasets[0].data = getExpenseDataForLastSixMonths();
        expensesChart.update();
        categoryChart.data = getCategoryBreakdownData();
        categoryChart.update();
        alert('Expense added successfully!');
        amountInput.value = '';
        descriptionInput.value = '';
        categoryInput.value = '';
    } 

    // Get Category Icon
    function getCategoryIcon(category) {
        switch(category.toLowerCase()) {
            case 'food': return '<i class="fas fa-utensils"></i>';
            case 'entertainment': return '<i class="fas fa-tv"></i>';
            case 'shopping': return '<i class="fas fa-shopping-bag"></i>';
            case 'utilities': return '<i class="fas fa-lightbulb"></i>';
            case 'transportation': return '<i class="fas fa-car-side"></i>';
            case 'income': return '<i class="fas fa-money-bill-wave"></i>';
            default: return '<i class="fas fa-ellipsis-h"></i>';
        }
    } 