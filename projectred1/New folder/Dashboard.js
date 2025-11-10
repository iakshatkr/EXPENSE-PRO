 // Initialize variables
 let totalIncome = 0;
 let totalExpenses = 0;
 let remainingBalance = 0;
 let transactions = [];

 // DOM elements
 const elements = {
     incomeAmount: document.getElementById('income-amount'),
     incomeDesc: document.getElementById('income-description'),
     expenseAmount: document.getElementById('expense-amount'),
     expenseDesc: document.getElementById('expense-description'),
     incomeList: document.getElementById('income-list'),
     expenseList: document.getElementById('expense-list'),
     monthDropdown: document.getElementById('month-dropdown'),
     monthlySummary: document.getElementById('monthly-summary'),
     pdfButton: document.getElementById('pdf-button'),
     csvButton: document.getElementById('csv-button')
 };

 // Indian Rupees formatter
 function formatINR(amount) {
     return new Intl.NumberFormat('en-IN', {
         style: 'currency',
         currency: 'INR',
         minimumFractionDigits: 2,
         maximumFractionDigits: 2
     }).format(amount);
 }

 // Update balance display
 function updateBalance() {
     document.getElementById('total-income').textContent = formatINR(totalIncome);
     document.getElementById('total-expenses').textContent = formatINR(totalExpenses);
     document.getElementById('remaining-balance').textContent = formatINR(remainingBalance);
 }

 // Get month-year in Indian format
 function getMonthYear(date) {
     return date.toLocaleDateString('en-IN', { 
         month: 'long', 
         year: 'numeric'
     });
 }

 // Show month summary
 function showMonthSummary(monthYear) {
     let monthIncome = 0;
     let monthExpenses = 0;
     
     transactions.forEach(t => {
         if (getMonthYear(t.date) === monthYear) {
             if (t.type === 'income') monthIncome += t.amount;
             else monthExpenses += t.amount;
         }
     });
     
     elements.monthlySummary.innerHTML = `
         <div class="summary" style="margin-top: 15px;">
             <div class="summary-item">
                 <h3>Income</h3>
                 <p>${formatINR(monthIncome)}</p>
             </div>
             <div class="summary-item">
                 <h3>Expenses</h3>
                 <p>${formatINR(monthExpenses)}</p>
             </div>
             <div class="summary-item">
                 <h3>Balance</h3>
                 <p>${formatINR(monthIncome - monthExpenses)}</p>
             </div>
         </div>
     `;
 }

 // Update monthly view
 function updateMonthlyView() {
     const months = new Set();
     transactions.forEach(t => {
         months.add(getMonthYear(t.date));
     });

     elements.monthDropdown.innerHTML = '<option value="">Select Month</option>';
     months.forEach(month => {
         const option = document.createElement('option');
         option.value = month;
         option.textContent = month;
         elements.monthDropdown.appendChild(option);
     });

     if (transactions.length > 0) {
         const currentMonth = getMonthYear(new Date());
         if (months.has(currentMonth)) {
             elements.monthDropdown.value = currentMonth;
             showMonthSummary(currentMonth);
         }
     }
 }

 // Generate PDF report
 function generatePDFReport() {
     const selectedMonth = elements.monthDropdown.value;
     if (!selectedMonth) {
         alert('Please select a month first');
         return;
     }

     // Create a new jsPDF instance
     const { jsPDF } = window.jspdf;
     const doc = new jsPDF();
     
     // Add title
     doc.setFont('helvetica', 'bold');
     doc.setFontSize(18);
     doc.text(`${selectedMonth} Expense Report`, 105, 20, { align: 'center' });
     
     // Get report data
     const monthlyTransactions = transactions.filter(t => 
         getMonthYear(t.date) === selectedMonth
     );
     
     // Add summary
     doc.setFontSize(12);
     doc.text(`Total Expenses: ${formatINR(totalExpenses)}`, 14, 40);
     doc.text(`Number of Transactions: ${monthlyTransactions.length}`, 14, 50);
     
     // Add transaction table
     doc.text('Transaction Details:', 14, 70);
     let yPos = 80;
     
     // Table headers
     doc.setFont('helvetica', 'bold');
     doc.text('Date', 14, yPos);
     doc.text('Description', 50, yPos);
     doc.text('Category', 120, yPos);
     doc.text('Amount', 170, yPos);
     doc.setFont('helvetica', 'normal');
     yPos += 10;
     
     // Table rows
     monthlyTransactions.forEach(t => {
         doc.text(t.date.toLocaleDateString('en-IN'), 14, yPos);
         doc.text(t.description, 50, yPos);
         doc.text(t.type === 'income' ? 'Income' : 'Expense', 120, yPos);
         doc.text(formatINR(t.amount), 170, yPos);
         yPos += 10;
         
         // Add new page if needed
         if (yPos > 280) {
             doc.addPage();
             yPos = 20;
         }
     });
     
     // Save the PDF
     doc.save(`${selectedMonth}_Expense_Report.pdf`);
 }

 // Generate CSV report
 function generateCSVReport() {
     const selectedMonth = elements.monthDropdown.value;
     if (!selectedMonth) {
         alert('Please select a month first');
         return;
     }

     const monthlyTransactions = transactions.filter(t => 
         getMonthYear(t.date) === selectedMonth
     );

     // Create CSV content
     let csvContent = "data:text/csv;charset=utf-8,";
     
     // Add header
     csvContent += `${selectedMonth} Expense Report\n\n`;
     csvContent += `Total Expenses,${formatINR(totalExpenses).replace(/\,/g, '')}\n`;
     csvContent += `Number of Transactions,${monthlyTransactions.length}\n\n`;
     
     // Add transaction details
     csvContent += "Date,Description,Category,Amount\n";
     
     monthlyTransactions.forEach(t => {
         csvContent += `${t.date.toLocaleDateString('en-IN')},${t.description},${t.type === 'income' ? 'Income' : 'Expense'},${formatINR(t.amount).replace(/\,/g, '')}\n`;
     });
     
     // Create download link
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `${selectedMonth}_Expense_Report.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
 }

 // Add transaction
 function addTransaction(type, amount, description) {
     const transaction = {
         type,
         amount,
         description,
         date: new Date()
     };
     
     transactions.push(transaction);
     
     // Update totals
     if (type === 'income') {
         totalIncome += amount;
         remainingBalance += amount;
     } else {
         totalExpenses += amount;
         remainingBalance -= amount;
     }
     
     // Add to history
     const list = type === 'income' ? elements.incomeList : elements.expenseList;
     const li = document.createElement('li');
     li.innerHTML = `
         <strong>${description}</strong>
         <span>${formatINR(amount)}</span>
     `;
     list.prepend(li);
     
     updateBalance();
     updateMonthlyView();
 }

 // Add income
 function addIncome() {
     const amount = parseFloat(elements.incomeAmount.value);
     const description = elements.incomeDesc.value.trim();

     if (amount && description) {
         addTransaction('income', amount, description);
         elements.incomeAmount.value = '';
         elements.incomeDesc.value = '';
     } else {
         alert('Please enter both amount and description');
     }
 }

 // Add expense
 function addExpense() {
     const amount = parseFloat(elements.expenseAmount.value);
     const description = elements.expenseDesc.value.trim();

     if (amount && description) {
         addTransaction('expense', amount, description);
         elements.expenseAmount.value = '';
         elements.expenseDesc.value = '';
     } else {
         alert('Please enter both amount and description');
     }
 }

 // Initialize
 document.addEventListener('DOMContentLoaded', () => {
     updateBalance();
     updateMonthlyView();
     elements.pdfButton.addEventListener('click', generatePDFReport);
     elements.csvButton.addEventListener('click', generateCSVReport);
     elements.monthDropdown.addEventListener('change', (e) => {
         if (e.target.value) showMonthSummary(e.target.value);
     });
 });