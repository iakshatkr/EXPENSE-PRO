    // Global variables
    let expenses = [
        { category: 'Food', amount: 450, date: '2023-10-05', type: 'expense' },
        { category: 'Entertainment', amount: 120, date: '2023-10-10', type: 'expense' },
        { category: 'Shopping', amount: 300, date: '2023-10-15', type: 'expense' },
        { category: 'Utilities', amount: 200, date: '2023-10-01', type: 'expense' },
        { category: 'Rent', amount: 1200, date: '2023-10-02', type: 'expense' },
        { category: 'Salary', amount: 3500, date: '2023-10-07', type: 'income' },
        { category: 'Food', amount: 380, date: '2023-09-05', type: 'expense' },
        { category: 'Entertainment', amount: 150, date: '2023-09-12', type: 'expense' },
        { category: 'Shopping', amount: 250, date: '2023-09-18', type: 'expense' },
        { category: 'Utilities', amount: 180, date: '2023-09-01', type: 'expense' },
        { category: 'Rent', amount: 1200, date: '2023-09-02', type: 'expense' },
        { category: 'Salary', amount: 3500, date: '2023-09-07', type: 'income' },
        { category: 'Food', amount: 400, date: '2023-08-05', type: 'expense' },
        { category: 'Entertainment', amount: 130, date: '2023-08-10', type: 'expense' },
        { category: 'Shopping', amount: 280, date: '2023-08-15', type: 'expense' }
    ];

    let categoryChartInstance = null;
    let expenseChartInstance = null;
    let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

    // DOM elements
    const generateReportBtn = document.getElementById('generate-report');
    const exportPdfBtn = document.getElementById('export-pdf');
    const exportCsvBtn = document.getElementById('export-csv');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const reportContainer = document.getElementById('report-container');
    const reportTitle = document.getElementById('report-title');
    const reportTotalIncome = document.getElementById('report-total-income');
    const reportTotalExpenses = document.getElementById('report-total-expenses');
    const reportBalance = document.getElementById('report-balance');
    const reportTableBody = document.getElementById('report-table-body');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const budgetProgress = document.getElementById('budget-progress');

    // Initialize the app
    document.addEventListener('DOMContentLoaded', function() {
        loadData();
        initializeCharts();

        // Event Listeners
        generateReportBtn.addEventListener('click', generateReport);
        exportPdfBtn.addEventListener('click', exportToPDF);
        exportCsvBtn.addEventListener('click', exportToCSV);
        themeToggleBtn.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            updateChartColors();
        });
    });

    // Load data from localStorage
    function loadData() {
        const savedExpenses = localStorage.getItem('expenses');
        if (savedExpenses) {
            expenses = JSON.parse(savedExpenses);
        }
    }

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    // Initialize Charts
    function initializeCharts() {
        // Category Doughnut Chart (initially empty)
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Expense Bar Chart (initial data for last 6 months) ...
        const expenseCtx = document.getElementById('expenseChart').getContext('2d');
        expenseChartInstance = new Chart(expenseCtx, {
            type: 'bar',
            data: {
                labels: ['May', 'June', 'July', 'Aug', 'Sep', 'Oct'],
                datasets: [{
                    label: 'Expenses',
                    data: [0, 0, 0, 810, 1660, 2270],
                    backgroundColor: ['#FF6384', '#58a9df', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                    borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Update Chart Colors for Dark Mode
    function updateChartColors() {
        const isDark = document.body.classList.contains('dark-mode');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        const tickColor = isDark ? '#e2e8f0' : '#2d3748';

        expenseChartInstance.options.scales.y.grid.color = gridColor;
        expenseChartInstance.options.scales.x.grid.color = gridColor;
        expenseChartInstance.options.scales.y.ticks.color = tickColor;
        expenseChartInstance.options.scales.x.ticks.color = tickColor;
        categoryChartInstance.options.plugins.legend.labels.color = tickColor;

        expenseChartInstance.update();
        categoryChartInstance.update();
    }

    // Generate Report
    function generateReport() {
        const reportType = document.getElementById('report-type').value;
        const reportMonth = document.getElementById('report-month').value;
        const reportYear = document.getElementById('report-year').value;
        
        // Filter expenses based on selected period
        let filteredExpenses = expenses;
        
        if (reportType === 'monthly') {
            const startDate = new Date(`${reportYear}-${reportMonth}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(endDate.getDate() - 1);
            
            filteredExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= startDate && expenseDate <= endDate;
            });
        } else if (reportType === 'yearly') {
            filteredExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getFullYear() === parseInt(reportYear);
            });
        }
        
        // Calculate totals
        const totalIncome = filteredExpenses
            .filter(expense => expense.type === 'income')
            .reduce((sum, expense) => sum + expense.amount, 0);
            
        const totalExpenses = filteredExpenses
            .filter(expense => expense.type === 'expense')
            .reduce((sum, expense) => sum + expense.amount, 0);
            
        const balance = totalIncome - totalExpenses;
        
        // Update report container
        reportTitle.textContent = reportType === 'monthly' 
            ? `Monthly Report - ${new Date(`${reportYear}-${reportMonth}-01`).toLocaleString('default', { month: 'long' })} ${reportYear}` 
            : `Yearly Report - ${reportYear}`;
            
        reportTotalIncome.textContent = `₹${totalIncome.toFixed(2)}`;
        reportTotalExpenses.textContent = `₹${totalExpenses.toFixed(2)}`;
        reportBalance.textContent = `₹${balance.toFixed(2)}`;
        
        // Populate table
        reportTableBody.innerHTML = '';
        filteredExpenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td>${expense.type.charAt(0).toUpperCase() + expense.type.slice(1)}</td>
                <td>${expense.category}</td>
                <td>${expense.type === 'expense' ? '-' : '+'}₹${expense.amount.toFixed(2)}</td>
            `;
            reportTableBody.appendChild(row);
        });
        
        // Show report container
        reportContainer.style.display = 'block';
        
        // Generate suggestions and update charts
        generateExpenseSuggestions(filteredExpenses);
        updateCategoryChart(filteredExpenses);
        updateBudgetComparison(filteredExpenses);
    }

    // Generate Expense Suggestions
    function generateExpenseSuggestions(filteredExpenses) {
        suggestionsContainer.innerHTML = '';
        
        // Calculate category totals
        const categoryTotals = {};
        filteredExpenses
            .filter(expense => expense.type === 'expense')
            .forEach(expense => {
                if (!categoryTotals[expense.category]) {
                    categoryTotals[expense.category] = 0;
                }
                categoryTotals[expense.category] += expense.amount;
            });
        
        // Calculate percentages
        const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const categoryPercentages = {};
        
        for (const category in categoryTotals) {
            categoryPercentages[category] = totalExpenses > 0 ? (categoryTotals[category] / totalExpenses) * 100 : 0;
        }
        
        // Generate suggestions based on spending patterns
        let suggestions = [];
        
        // Check for high spending categories
        for (const category in categoryPercentages) {
            if (categoryPercentages[category] > 20) {
                suggestions.push(`Consider reducing your spending on ${category}. It accounts for ${categoryPercentages[category].toFixed(1)}% of your total expenses.`);
            }
        }
        
        // Check for specific categories where people commonly overspend
        if (categoryTotals['Food'] && categoryTotals['Food'] > 400) {
            suggestions.push('Your food expenses are high. Consider meal planning or cooking at home more often to save money.');
        }
        
        if (categoryTotals['Shopping'] && categoryTotals['Shopping'] > 250) {
            suggestions.push('Your shopping expenses are relatively high. Try creating a shopping list to avoid impulse purchases.');
        }
        
        if (categoryTotals['Entertainment'] && categoryTotals['Entertainment'] > 100) {
            suggestions.push('Entertainment expenses are on the higher side. Look for free or low-cost entertainment options.');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('Your spending looks healthy! Keep up the good work with your financial management.');
        }
        
        // Display suggestions
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            suggestionElement.innerHTML = `
                <div class="suggestion-icon"><i class="fas fa-lightbulb"></i></div>
                <div class="suggestion-text">${suggestion}</div>
            `;
            suggestionsContainer.appendChild(suggestionElement);
        });
    }

    // Update Category Doughnut Chart
    function updateCategoryChart(filteredExpenses) {
        const categoryTotals = {};
        filteredExpenses
            .filter(expense => expense.type === 'expense')
            .forEach(expense => {
                if (!categoryTotals[expense.category]) {
                    categoryTotals[expense.category] = 0;
                }
                categoryTotals[expense.category] += expense.amount;
            });
        
        const categories = Object.keys(categoryTotals);
        const amounts = Object.values(categoryTotals);
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#4ACAB5', '#F8B458'];
        
        categoryChartInstance.data.labels = categories;
        categoryChartInstance.data.datasets[0].data = amounts;
        categoryChartInstance.data.datasets[0].backgroundColor = colors.slice(0, categories.length);
        categoryChartInstance.update();
    }

    // Update Chart Period (Placeholder for future functionality)
    function updateChartPeriod(period) {
        alert(`Chart period update to ${period} is a placeholder. Implement dynamic data filtering based on period.`);
        // Future implementation: Filter data based on day/week/month/year and update charts
    }

    // Set Budget
    function setBudget() {
        const category = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid budget amount.');
            return;
        }
        
        budgets[category] = amount;
        localStorage.setItem('budgets', JSON.stringify(budgets));
        document.getElementById('budget-amount').value = '';
        alert(`Budget of ₹${amount} set for ${category === 'total' ? 'Total Expenses' : category}.`);
        
        // Refresh budget comparison if a report is already generated
        if (reportContainer.style.display === 'block') {
            const reportType = document.getElementById('report-type').value;
            const reportMonth = document.getElementById('report-month').value;
            const reportYear = document.getElementById('report-year').value;
            let filteredExpenses = expenses;
            if (reportType === 'monthly') {
                const startDate = new Date(`${reportYear}-${reportMonth}-01`);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(endDate.getDate() - 1);
                filteredExpenses = expenses.filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate >= startDate && expenseDate <= endDate;
                });
            } else if (reportType === 'yearly') {
                filteredExpenses = expenses.filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getFullYear() === parseInt(reportYear);
                });
            }
            updateBudgetComparison(filteredExpenses);
        }
    }

    // Update Budget Comparison
    function updateBudgetComparison(filteredExpenses) {
        budgetProgress.innerHTML = '';
        if (Object.keys(budgets).length === 0) {
            budgetProgress.innerHTML = '<p>No budgets set. Use the form above to set a budget.</p>';
            return;
        }
        
        const categoryTotals = {};
        filteredExpenses
            .filter(expense => expense.type === 'expense')
            .forEach(expense => {
                if (!categoryTotals[expense.category]) {
                    categoryTotals[expense.category] = 0;
                }
                categoryTotals[expense.category] += expense.amount;
            });
        
        const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        
        for (const category in budgets) {
            const budgetAmount = budgets[category];
            const spent = category === 'total' ? totalExpenses : (categoryTotals[category] || 0);
            const percentage = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
            const progressDiv = document.createElement('div');
            progressDiv.style.marginBottom = '15px';
            progressDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${category === 'total' ? 'Total Expenses' : category}</span>
                    <span>₹${spent.toFixed(2)} / ₹${budgetAmount.toFixed(2)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            `;
            budgetProgress.appendChild(progressDiv);
        }
    }

    // Export to PDF
    function exportToPDF() {
        const { jsPDF } = window.jspdf;
        const reportTitleText = reportTitle.textContent;
        const totalIncome = reportTotalIncome.textContent;
        const totalExpenses = reportTotalExpenses.textContent;
        const balance = reportBalance.textContent;
        const table = document.getElementById('report-table');
        
        // Create a new PDF document
        const pdf = new jsPDF('p', 'pt', 'letter');
        
        // Add title
        pdf.setFontSize(18);
        pdf.text(reportTitleText, 40, 40);
        
        // Add summary
        pdf.setFontSize(14);
        pdf.text(`Total Income: ${totalIncome}`, 40, 80);
        pdf.text(`Total Expenses: ${totalExpenses}`, 40, 100);
        pdf.text(`Balance: ${balance}`, 40, 120);
        
        // Add transaction details
        pdf.setFontSize(12);
        pdf.text('Transaction Details:', 40, 160);
        
        // Add table headers
        let yPos = 190;
        const headers = ['Date', 'Type', 'Category', 'Amount'];
        headers.forEach((header, index) => {
            pdf.text(header, 40 + index * 100, yPos);
        });
        yPos += 20;
        
        // Add table rows
        for (let i = 0; i < table.rows.length - 1 && yPos < 750; i++) { // Limit to avoid overflow
            const cells = table.rows[i + 1].cells;
            for (let j = 0; j < cells.length; j++) {
                pdf.text(cells[j].textContent, 40 + j * 100, yPos);
            }
            yPos += 20;
        }
        
        // Save PDF
        pdf.save(`${reportTitleText}.pdf`);
    }

    // Export to CSV
    function exportToCSV() {
        const reportTitleText = reportTitle.textContent;
        const table = document.getElementById('report-table');
        
        // Extract table data
        const rows = [];
        const headers = [];
        for (let i = 0; i < table.rows[0].cells.length; i++) {
            headers.push(table.rows[0].cells[i].textContent);
        }
        rows.push(headers);
        
        for (let i = 1; i < table.rows.length; i++) {
            const row = [];
            for (let j = 0; j < table.rows[i].cells.length; j++) {
                row.push(table.rows[i].cells[j].textContent);
            }
            rows.push(row);
        }
        
        // Convert to CSV
        const csv = Papa.unparse(rows);
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportTitleText}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
