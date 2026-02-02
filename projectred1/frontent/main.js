 // Dark Mode Toggle
 document.getElementById('theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    updateChartColors(); //calls a function to update charts when theme changes
});

// Sample data for charts
const expenseData = {
    labels: ['Sep 1', 'Sep 3', 'Sep 5', 'Sep 10', 'Sep 15', 'Sep 20', 'Sep 25', 'Oct 1'],
    datasets: [{
        label: 'Expenses',
        data: [5000, 7500, 10000, 12000, 9000, 8000, 11000, 13000],
        backgroundColor: 'rgba(91, 33, 182, 0.2)',
        borderColor: 'rgba(91, 33, 182, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
    }]
};

const categoryData = {
    labels: ['Food', 'Entertainment', 'Shopping', 'Travel', 'Utilities', 'Other'],
    datasets: [{
        data: [30000, 15000, 20000, 15000, 10000, 10000],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        borderWidth: 0
    }]
};

// Function to update chart colors based on theme
function updateChartColors() {
    const isDark = document.body.classList.contains('dark-mode');
    expensesChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    expensesChart.options.scales.x.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    expensesChart.options.scales.y.ticks.color = isDark ? '#e2e8f0' : '#2d3748';
    expensesChart.options.scales.x.ticks.color = isDark ? '#e2e8f0' : '#2d3748';
    categoryChart.options.plugins.legend.labels.color = isDark ? '#e2e8f0' : '#2d3748';
    expensesChart.update();
    categoryChart.update();
}

// Initialize charts
let expensesChart, categoryChart;
window.onload = function() {
    // Expenses Chart
    const expensesCtx = document.getElementById('expenses-chart').getContext('2d');
    expensesChart = new Chart(expensesCtx, {
        type: 'line',
        data: expenseData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true, mode: 'index' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#2d3748' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#2d3748' }
                }
            },
            animation: { duration: 1500, easing: 'easeInOutQuad' }
        }
    }); 

    // Category Chart
    const categoryCtx = document.getElementById('category-chart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: categoryData,
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

    // Form submission
    document.getElementById('expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Expense added successfully!');
        this.reset();
    });
};