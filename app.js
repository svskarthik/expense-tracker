// Expense Tracker Application
class ExpenseTracker {
    constructor() {
        // In-memory data storage
        this.transactions = [];
        this.nextId = 1;
        this.categories = [
            'Food',
            'Transportation', 
            'Entertainment',
            'Shopping',
            'Bills',
            'Healthcare',
            'Education',
            'Other'
        ];
        
        // Chart.js instance
        this.expenseChart = null;
        
        // Chart colors
        this.chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
        
        // Initialize the application
        this.init();
    }
    
    init() {
        // Load sample data
        this.loadSampleData();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize chart
        this.initChart();
        
        // Initial render
        this.updateSummary();
        this.renderTransactions();
        this.updateChart();
    }
    
    loadSampleData() {
        // Add sample transactions
        const sampleTransactions = [
            {
                id: this.nextId++,
                amount: 2500,
                description: "Salary",
                category: "Other",
                type: "income",
                date: this.formatDate(new Date())
            },
            {
                id: this.nextId++,
                amount: 50,
                description: "Grocery shopping",
                category: "Food",
                type: "expense", 
                date: this.formatDate(new Date())
            }
        ];
        
        this.transactions = [...sampleTransactions];
    }
    
    setupEventListeners() {
        // Form submission
        const form = document.getElementById('transaction-form');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        
        // Delete button clicks (event delegation)
        const transactionsList = document.getElementById('transactions-list');
        if (transactionsList) {
            transactionsList.addEventListener('click', this.handleDeleteClick.bind(this));
        }
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form elements
        const amountEl = document.getElementById('amount');
        const descriptionEl = document.getElementById('description');
        const categoryEl = document.getElementById('category');
        const typeEl = document.querySelector('input[name="type"]:checked');
        
        // Get values
        const amount = parseFloat(amountEl.value);
        const description = descriptionEl.value.trim();
        const category = categoryEl.value;
        const type = typeEl ? typeEl.value : null;
        
        // Validate input
        if (!this.validateTransaction(amount, description, category, type)) {
            return;
        }
        
        // Create new transaction
        const transaction = {
            id: this.nextId++,
            amount: amount,
            description: description,
            category: category,
            type: type,
            date: this.formatDate(new Date())
        };
        
        // Add transaction
        this.addTransaction(transaction);
        
        // Clear form
        this.clearForm();
        
        // Show success feedback
        this.showMessage('Transaction added successfully!', 'success');
    }
    
    clearForm() {
        document.getElementById('amount').value = '';
        document.getElementById('description').value = '';
        document.getElementById('category').value = '';
        const radioButtons = document.querySelectorAll('input[name="type"]');
        radioButtons.forEach(radio => radio.checked = false);
    }
    
    validateTransaction(amount, description, category, type) {
        // Clear previous messages
        this.clearMessages();
        
        let isValid = true;
        let errorMessage = '';
        
        if (!amount || isNaN(amount) || amount <= 0) {
            errorMessage = 'Please enter a valid amount greater than 0.';
            isValid = false;
        } else if (!description || description.length === 0) {
            errorMessage = 'Please enter a description.';
            isValid = false;
        } else if (!category) {
            errorMessage = 'Please select a category.';
            isValid = false;
        } else if (!type) {
            errorMessage = 'Please select transaction type (Income or Expense).';
            isValid = false;
        }
        
        if (!isValid) {
            this.showMessage(errorMessage, 'error');
        }
        
        return isValid;
    }
    
    addTransaction(transaction) {
        // Add to transactions array
        this.transactions.push(transaction);
        
        // Update all displays
        this.updateSummary();
        this.renderTransactions();
        this.updateChart();
    }
    
    deleteTransaction(id) {
        // Find transaction index
        const index = this.transactions.findIndex(t => t.id === parseInt(id));
        
        if (index !== -1) {
            // Remove transaction with animation
            const transactionElement = document.querySelector(`[data-transaction-id="${id}"]`);
            if (transactionElement) {
                transactionElement.classList.add('slide-out');
                
                setTimeout(() => {
                    // Remove from data array
                    this.transactions.splice(index, 1);
                    
                    // Update all displays
                    this.updateSummary();
                    this.renderTransactions();
                    this.updateChart();
                    
                    this.showMessage('Transaction deleted successfully!', 'success');
                }, 200);
            } else {
                // Fallback if element not found
                this.transactions.splice(index, 1);
                this.updateSummary();
                this.renderTransactions();
                this.updateChart();
                this.showMessage('Transaction deleted successfully!', 'success');
            }
        }
    }
    
    handleDeleteClick(e) {
        // Check if clicked element is delete button or its child
        let deleteButton = null;
        
        if (e.target.classList.contains('delete-btn')) {
            deleteButton = e.target;
        } else if (e.target.parentElement && e.target.parentElement.classList.contains('delete-btn')) {
            deleteButton = e.target.parentElement;
        }
        
        if (deleteButton) {
            const transactionId = deleteButton.getAttribute('data-id');
            
            if (transactionId && confirm('Are you sure you want to delete this transaction?')) {
                this.deleteTransaction(transactionId);
            }
        }
    }
    
    updateSummary() {
        const summary = this.calculateSummary();
        
        // Update DOM elements
        const balanceEl = document.getElementById('balance');
        const incomeEl = document.getElementById('total-income');
        const expensesEl = document.getElementById('total-expenses');
        
        if (balanceEl) balanceEl.textContent = this.formatCurrency(summary.balance);
        if (incomeEl) incomeEl.textContent = this.formatCurrency(summary.totalIncome);
        if (expensesEl) expensesEl.textContent = this.formatCurrency(summary.totalExpenses);
    }
    
    calculateSummary() {
        let totalIncome = 0;
        let totalExpenses = 0;
        
        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += transaction.amount;
            }
        });
        
        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses
        };
    }
    
    renderTransactions() {
        const container = document.getElementById('transactions-list');
        
        if (!container) return;
        
        if (this.transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No transactions yet. Add your first transaction above!</p>
                </div>
            `;
            return;
        }
        
        // Sort transactions by date (newest first) and by ID as secondary
        const sortedTransactions = [...this.transactions].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() === dateB.getTime()) {
                return b.id - a.id; // Newer IDs first
            }
            return dateB - dateA;
        });
        
        container.innerHTML = sortedTransactions.map(transaction => `
            <div class="transaction-item fade-in" data-transaction-id="${transaction.id}">
                <div class="transaction-details">
                    <div class="transaction-description">${this.escapeHtml(transaction.description)}</div>
                    <div class="transaction-meta">
                        <span class="category-badge">${transaction.category}</span>
                        <span>${transaction.date}</span>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${this.formatCurrency(transaction.amount)}
                </div>
                <button class="delete-btn" data-id="${transaction.id}" title="Delete transaction" aria-label="Delete ${transaction.description}">
                    ×
                </button>
            </div>
        `).join('');
    }
    
    initChart() {
        const ctx = document.getElementById('expense-chart');
        if (!ctx) return;
        
        this.expenseChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: this.chartColors,
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim()
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim()
                        }
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim(),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim(),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim(),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim(),
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 800
                }
            }
        });
    }
    
    updateChart() {
        if (!this.expenseChart) return;
        
        // Get expense data grouped by category
        const expenseData = this.getExpenseByCategory();
        
        const chartContainer = document.querySelector('.chart-container');
        const emptyState = document.getElementById('chart-empty-state');
        
        if (!chartContainer || !emptyState) return;
        
        if (expenseData.length === 0) {
            chartContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        chartContainer.style.display = 'block';
        emptyState.style.display = 'none';
        
        // Update chart data
        this.expenseChart.data.labels = expenseData.map(item => item.category);
        this.expenseChart.data.datasets[0].data = expenseData.map(item => item.amount);
        
        // Animate chart update
        this.expenseChart.update('active');
    }
    
    getExpenseByCategory() {
        // Filter only expense transactions
        const expenses = this.transactions.filter(t => t.type === 'expense');
        
        if (expenses.length === 0) return [];
        
        // Group by category and sum amounts
        const categoryTotals = {};
        
        expenses.forEach(expense => {
            if (categoryTotals[expense.category]) {
                categoryTotals[expense.category] += expense.amount;
            } else {
                categoryTotals[expense.category] = expense.amount;
            }
        });
        
        // Convert to array and sort by amount (highest first)
        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }
    
    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    clearMessages() {
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
    }
    
    showMessage(message, type = 'info') {
        // Remove existing messages
        this.clearMessages();
        
        // Create new message element
        const messageElement = document.createElement('div');
        messageElement.className = `message message--${type}`;
        messageElement.textContent = message;
        
        // Insert at the top of the form section
        const formSection = document.querySelector('.form-section .card__body');
        if (formSection) {
            formSection.insertBefore(messageElement, formSection.firstChild);
            
            // Auto-remove after 4 seconds
            setTimeout(() => {
                if (messageElement && messageElement.parentNode) {
                    messageElement.style.transition = 'opacity 0.3s ease-out';
                    messageElement.style.opacity = '0';
                    setTimeout(() => {
                        messageElement.remove();
                    }, 300);
                }
            }, 4000);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all resources are loaded
    setTimeout(() => {
        window.expenseTracker = new ExpenseTracker();
    }, 100);
});

// Export for testing purposes (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExpenseTracker;
}