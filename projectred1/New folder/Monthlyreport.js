document.addEventListener('DOMContentLoaded', function() {
    // Sample transactions data
    const transactions = [
        { id: 1, amount: 5000, type: 'income', category: 'salary', date: '2023-10-01' },
        { id: 2, amount: 1200, type: 'expense', category: 'rent', date: '2023-10-02' },
        { id: 3, amount: 300, type: 'expense', category: 'food', date: '2023-10-03' },
        { id: 4, amount: 200, type: 'expense', category: 'transport', date: '2023-10-04' },
        { id: 5, amount: 500, type: 'expense', category: 'shopping', date: '2023-10-05' },
        { id: 6, amount: 1000, type: 'income', category: 'freelance', date: '2023-10-06' },
        { id: 7, amount: 6000, type: 'income', category: 'salary', date: '2023-11-01' },
        { id: 8, amount: 1300, type: 'expense', category: 'rent', date: '2023-11-02' }
    ];

    // DOM Elements
    const reportType = document.getElementById('report-type');
    const reportMonth = document.getElementById('report-month');
    const reportYear = document.getElementById('report-year');
    const generateReportBtn = document.getElementById('generate-report');
    const reportContainer = document.getElementById('report-container');
    const reportTitle = document.getElementById('report-title');
    const reportTotalIncome = document.getElementById('report-total-income');
    const reportTotalExpenses = document.getElementById('report-total-expenses');
    const reportBalance = document.getElementById('report-balance');
    const reportTableBody = document.getElementById('report-table-body');
    const exportPdfBtn = document.getElementById('export-pdf');
    const exportCsvBtn = document.getElementById('export-csv');

    // Chart variables
    let reportChart;

    // Handle report generation
    generateReportBtn.addEventListener('click', function() {
        const reportTypeValue = reportType.value;
        const month = reportMonth.value;
        const year = reportYear.value;

        // Filter transactions based on report type
        let filteredTransactions;
        if (reportTypeValue === 'monthly') {
            filteredTransactions = transactions.filter(t => 
                t.date.substring(0, 7) === `${year}-${month}`
            );
            reportTitle.textContent = `${year} - ${month} Report`;
        } else {
            filteredTransactions = transactions.filter(t => 
                t.date.substring(0, 4) === year
            );
            reportTitle.textContent = `${year} Yearly Report`;
        }

        // Calculate totals
        const totalIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        // Update report summary
        reportTotalIncome.textContent = `$${totalIncome}`;
        reportTotalExpenses.textContent = `$${totalExpenses}`;
        reportBalance.textContent = `$${balance}`;

        // Render transactions
        reportTableBody.innerHTML = '';
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.className = transaction.type;
            row.innerHTML = `
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.type}</td>
                <td>${transaction.category}</td>
                <td>$${transaction.amount}</td>
            `;
            reportTableBody.appendChild(row);
        });

        // Create chart
        createChart(filteredTransactions);

        // Show report container
        reportContainer.style.display = 'block';
    });

    // Create chart for report
    function createChart(filteredTransactions) {
        const ctx = document.getElementById('report-chart').getContext('2d');
        
        // Calculate expenses by category
        const expensesByCategory = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        // Destroy previous chart if it exists
        if (reportChart) {
            reportChart.destroy();
        }

        // Create new chart
        reportChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(expensesByCategory),
                datasets: [{
                    data: Object.values(expensesByCategory),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#fff'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Spending by Category',
                        color: '#fff'
                    }
                }
            }
        });
    }

    // Format date to MM/DD/YYYY
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    }

    // Export report as PDF
    exportPdfBtn.addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text(reportTitle.textContent, 14, 20);

        // Add summary
        doc.setFontSize(14);
        doc.text(`Total Income: $${reportTotalIncome.textContent}`, 14, 30);
        doc.text(`Total Expenses: $${reportTotalExpenses.textContent}`, 14, 37);
        doc.text(`Balance: $${reportBalance.textContent}`, 14, 44);

        // Add table header
        doc.setFontSize(12);
        doc.text('Date', 14, 55);
        doc.text('Type', 40, 55);
        doc.text('Category', 60, 55);
        doc.text('Amount', 90, 55);

        // Add table rows
        let y = 62;
        document.querySelectorAll('#report-table-body tr').forEach(row => {
            const cells = row.cells;
            doc.text(cells[0].textContent, 14, y);
            doc.text(cells[1].textContent, 40, y);
            doc.text(cells[2].textContent, 60, y);
            doc.text(cells[3].textContent, 90, y);
            y += 7;
        });

        // Save PDF
        doc.save(`${reportTitle.textContent}.pdf`);
    });

    // Export report as CSV
    exportCsvBtn.addEventListener('click', function() {
        const rows = [];
        document.querySelectorAll('#report-table-body tr').forEach(row => {
            const cells = Array.from(row.cells).map(cell => cell.textContent);
            rows.push(cells);
        });

        const csv = Papa.unparse({
            fields: ['Date', 'Type', 'Category', 'Amount'],
            data: rows
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportTitle.textContent}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});