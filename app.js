class ExpenseTracker {
    constructor() {
        this.transactions = [];
        this.categories = [
            'Food', 'Transportation', 'Entertainment',
            'Shopping', 'Bills', 'Healthcare', 'Education', 'Other',
            'Income','Rent' // added for income transactions
        ];
        this.initialize();
    }

    initialize() {
        this.loadTransactions();
        this.setupForm();
        this.renderSummary();
        this.renderTransactions();
        this.renderChart();
    }

    setupForm() {
        const form = document.getElementById('transaction-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransaction();
        });
    }

    validateTransaction(amount, description, category, type) {
        let isValid = true;
        let errorMessage = '';

        if (!amount || isNaN(amount) || amount <= 0) {
            errorMessage = 'Please enter a valid amount.';
            isValid = false;
        } else if (!description.trim()) {
            errorMessage = 'Please enter a description.';
            isValid = false;
        } else if (type === 'expense' && !category) {
            errorMessage = 'Please select a category for expenses.';
            isValid = false;
        }

        return { isValid, errorMessage };
    }

    handleTransaction() {
        const amountEl = document.getElementById('amount');
        const descriptionEl = document.getElementById('description');
        const categoryEl = document.getElementById('category');
        const type = document.querySelector('input[name="type"]:checked')?.value;

        let amount = parseFloat(amountEl.value);
        let description = descriptionEl.value;
        let category = categoryEl.value;

        
        if (type === 'income') {
            category = 'Income';
        }

        const { isValid, errorMessage } = this.validateTransaction(amount, description, category, type);

        if (!isValid) {
            this.showMessage(errorMessage, 'error');
            return;
        }

        const transaction = {
            id: Date.now(),
            amount,
            description,
            category,
            type,
            date: new Date().toLocaleDateString()
        };

        this.transactions.push(transaction);
        this.saveTransactions();

        this.renderSummary();
        this.renderTransactions();
        this.renderChart();

        this.showMessage('Transaction added successfully!', 'success');
        this.resetForm();
    }

    renderSummary() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;

        document.getElementById('balance').textContent = `₹${balance.toFixed(2)}`;
        document.getElementById('total-income').textContent = `₹${income.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `₹${expenses.toFixed(2)}`;
    }

    renderTransactions() {
        const list = document.getElementById('transactions-list');
        list.innerHTML = '';

        if (this.transactions.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <p>No transactions yet. Add your first transaction above!</p>
                </div>
            `;
            return;
        }

        this.transactions.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'transaction-item fade-in';
            item.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span class="category-badge">${transaction.category}</span>
                        <span>${transaction.date}</span>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.amount.toFixed(2)}
                </div>
                <button class="delete-btn" onclick="tracker.deleteTransaction(${transaction.id})">×</button>
            `;
            list.appendChild(item);
        });
    }

    renderChart() {
        const ctx = document.getElementById('expense-chart').getContext('2d');
        const expenseTransactions = this.transactions.filter(t => t.type === 'expense');

        const chartEmptyState = document.getElementById('chart-empty-state');
        if (expenseTransactions.length === 0) {
            chartEmptyState.classList.remove('hidden');
        } else {
            chartEmptyState.classList.add('hidden');
        }

        if (this.chart) {
            this.chart.destroy();
        }

        const categoryTotals = {};
        expenseTransactions.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    data: Object.values(categoryTotals),
                    backgroundColor: [
                        '#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6',
                        '#ec4899', '#14b8a6', '#f97316'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
        this.renderSummary();
        this.renderTransactions();
        this.renderChart();
    }

    resetForm() {
        document.getElementById('transaction-form').reset();
    }

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    loadTransactions() {
        const stored = localStorage.getItem('transactions');
        if (stored) {
            this.transactions = JSON.parse(stored);
        }
    }

    showMessage(text, type) {
        const message = document.createElement('div');
        message.className = `message message--${type}`;
        message.textContent = text;

        const formSection = document.querySelector('.form-section .card__body');
        formSection.insertBefore(message, formSection.firstChild);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

const tracker = new ExpenseTracker();
