let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const themeToggle = document.getElementById('themeToggle');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const typeSelect = document.getElementById('type');
const dateInput = document.getElementById('date');
const addBtn = document.getElementById('addBtn');
const searchInput = document.getElementById('searchInput');
const filterType = document.getElementById('filterType');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const clearBtn = document.getElementById('clearBtn');
const fileInput = document.getElementById('fileInput');
const transactionsList = document.getElementById('transactionsList');

// Set today's date as default
dateInput.valueAsDate = new Date();

// Theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// Add transaction
addBtn.addEventListener('click', addTransaction);

function addTransaction() {
  const description = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  
  if (!description || !amount || amount <= 0) {
    alert('Please enter valid description and amount');
    return;
  }

  const transaction = {
    id: Date.now(),
    description,
    amount,
    category: categorySelect.value,
    type: typeSelect.value,
    date: dateInput.value,
    createdAt: new Date().toISOString()
  };

  transactions.push(transaction);
  saveTransactions();
  render();

  descInput.value = '';
  amountInput.value = '';
  dateInput.valueAsDate = new Date();
}

// Delete transaction
function deleteTransaction(id) {
  if (confirm('Delete this transaction?')) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    render();
  }
}

// Export/Import
exportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(transactions, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        if (confirm('Import these transactions? This will add to existing data.')) {
          transactions = [...transactions, ...imported];
          saveTransactions();
          render();
        }
      } else {
        alert('Invalid JSON format');
      }
    } catch (err) {
      alert('Error reading file: ' + err.message);
    }
  };
  reader.readAsText(file);
  fileInput.value = '';
});

clearBtn.addEventListener('click', () => {
  if (confirm('Delete ALL transactions? This cannot be undone!')) {
    transactions = [];
    saveTransactions();
    render();
  }
});

// Search and filter
searchInput.addEventListener('input', render);
filterType.addEventListener('change', render);

// Render
function render() {
  const search = searchInput.value.toLowerCase();
  const filter = filterType.value;

  let filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search) || 
                         t.category.toLowerCase().includes(search);
    const matchesFilter = filter === 'all' || t.type === filter;
    return matchesSearch && matchesFilter;
  });

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Render transactions
  if (filtered.length === 0) {
    transactionsList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem">No transactions found</p>';
  } else {
    transactionsList.innerHTML = filtered.map(t => `
      <div class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-desc">${escapeHtml(t.description)}</div>
          <div class="transaction-meta">${t.category} • ${t.date}</div>
        </div>
        <div class="transaction-amount ${t.type}">
          ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
        </div>
        <div class="transaction-actions">
          <button onclick="deleteTransaction(${t.id})" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  updateSummary();
  updateChart();
}

function updateSummary() {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  document.getElementById('totalIncome').textContent = `$${income.toFixed(2)}`;
  document.getElementById('totalExpense').textContent = `$${expense.toFixed(2)}`;
  document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
}

function updateChart() {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryTotals = {};

  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxAmount = sorted.length > 0 ? sorted[0][1] : 1;

  const chartHTML = sorted.map(([category, amount]) => {
    const percentage = (amount / maxAmount) * 100;
    return `
      <div class="chart-item">
        <div class="chart-label">${category}</div>
        <div class="chart-bar" style="width: ${percentage}%">
          <div class="chart-value">$${amount.toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('categoryChart').innerHTML = chartHTML || '<p style="color:var(--text-secondary)">No expense data</p>';
}

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

render();
