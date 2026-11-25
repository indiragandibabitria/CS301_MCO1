// Retrieve saved transactions from localStorage or initialize an empty array if none exist
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
// Get the DOM element for displaying the total net balance
const balanceEl = document.getElementById('balance');
// Get the DOM element for displaying total income in the top metric card
const totalIncomeEl = document.getElementById('total-income');
// Get the DOM element for displaying total expenses in the top metric card
const totalExpensesEl = document.getElementById('total-expenses');

// Get the DOM element for displaying income in the overview section
const overviewIncome = document.getElementById('overview-income');
// Get the DOM element for displaying expenses in the overview section
const overviewExpenses = document.getElementById('overview-expenses');
// Get the DOM element for displaying remaining balance in the overview section
const overviewRemaining = document.getElementById('overview-remaining');

// Get the DOM element for the income progress bar fill
const barIncome = document.getElementById('bar-income');
// Get the DOM element for the expenses progress bar fill
const barExpenses = document.getElementById('bar-expenses');
// Get the DOM element for the remaining balance progress bar fill
const barRemaining = document.getElementById('bar-remaining');

// Get the DOM element for the transaction history list container
const listEl = document.getElementById('transaction-list');
// Get the DOM element for the transaction entry form
const form = document.getElementById('budget-form');
// Get the DOM input element for transaction description
const descriptionInput = document.getElementById('description');
// Get the DOM input element for transaction amount
const amountInput = document.getElementById('amount');
// Get the DOM select/input element for transaction type (income or expense)
const typeInput = document.getElementById('type');
// Get the DOM button element for clearing all stored transactions
const clearAllBtn = document.getElementById('clear-all-btn');
const undoAllBtn = document.getElementById('undo-all-btn');

// Backup for the last Clear All action
let clearedTransactions = null;


// Update UI
// Main function to refresh all displayed values, elements, and persistent storage
function updateUI() {
  // Clear all existing list items from the history container
  listEl.innerHTML = '';

  // Initialize accumulator variable for total income
  let income = 0;
  // Initialize accumulator variable for total expenses
  let expenses = 0;

  // Loop through every transaction in the state array
  transactions.forEach((t) => {
    // Create a new list item element for the transaction entry
    const item = document.createElement('li');
    // Add the transaction type (income/expense) as a CSS class to the list item
    item.classList.add(t.type);
    // Set internal HTML markup showing transaction description and formatted amount
    item.innerHTML = `
      <span>${t.description}</span>
      <span>₱${t.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    `;
    // Append the newly created list item to the history list container
    listEl.appendChild(item);

    // Check if current transaction is an income type
    if (t.type === 'income') {
      // Add transaction amount to total income accumulator
      income += t.amount;
    // Handle expense transaction types
    } else {
      // Add transaction amount to total expenses accumulator
      expenses += t.amount;
    }
  });

  // Calculate net balance by subtracting expenses from income
  const balance = income - expenses;

  // Format currency helper
  // Define helper function to format raw numeric values into Philippine Peso currency strings
  const formatPHP = (val) => `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Update numbers
  // Update net balance label text content
  balanceEl.textContent = formatPHP(balance);
  // Update total income label text content
  totalIncomeEl.textContent = formatPHP(income);
  // Update total expenses label text content
  totalExpensesEl.textContent = formatPHP(expenses);

  // Update overview section income text content
  overviewIncome.textContent = formatPHP(income);
  // Update overview section expenses text content
  overviewExpenses.textContent = formatPHP(expenses);
  // Update overview section remaining balance text content
  overviewRemaining.textContent = formatPHP(balance);

  // Dynamic progress bars calculation
  // Calculate combined sum of absolute cash movements (income + expenses)
  const totalMoneyValue = income + expenses;
  // Check if there is any financial activity recorded
  if (totalMoneyValue > 0) {
    // Calculate income percentage share relative to overall monetary flow
    const incomePercent = Math.round((income / totalMoneyValue) * 100);
    // Calculate expense percentage share relative to overall monetary flow
    const expensePercent = Math.round((expenses / totalMoneyValue) * 100);
    // Calculate remaining percentage relative to total income (floor at 0%)
    const balancePercent = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;

    // Set width style property of income bar to calculated percentage
    barIncome.style.width = `${incomePercent}%`;
    // Set width style property of expenses bar to calculated percentage
    barExpenses.style.width = `${expensePercent}%`;
    // Set width style property of remaining bar to calculated percentage
    barRemaining.style.width = `${balancePercent}%`;
  // Reset progress bars when no transaction data exists
  } else {
    // Set income bar width to 0%
    barIncome.style.width = `0%`;
    // Set expenses bar width to 0%
    barExpenses.style.width = `0%`;
    // Set remaining bar width to 0%
    barRemaining.style.width = `0%`;
  }

  // Persist updated transactions array to browser localStorage as a JSON string
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Add Transaction
// Attach submit event handler to the transaction input form
form.addEventListener('submit', (e) => {
  // Prevent default page reload on form submission
  e.preventDefault();

  // Construct new transaction object using current form field values
  const newTransaction = {
    // Read string value from description input field
    description: descriptionInput.value,
    // Parse numeric float value from amount input field
    amount: parseFloat(amountInput.value),
    // Read selected value from type dropdown/input field
    type: typeInput.value
  };

  // Push new transaction object to global transactions array
  transactions.push(newTransaction);
  // Re-render UI metrics and update persistent storage
  updateUI();

  // Reset description input field value to empty string
  descriptionInput.value = '';
  // Reset amount input field value to empty string
  amountInput.value = '';
});


 // Clear All Transactions
clearAllBtn.addEventListener('click', () => {
  if (transactions.length === 0) {
    alert("There are no transactions to clear.");
    return;
  }

  if (confirm("Are you sure you want to clear your transaction history?")) {
    // Save transactions before clearing them
    clearedTransactions = [...transactions];

    transactions = [];
    updateUI();

    // Enable Undo
    undoAllBtn.disabled = false;
  }
});

// Undo Clear All
undoAllBtn.addEventListener('click', () => {
  if (clearedTransactions === null) return;

  // Restore the saved transactions
  transactions = clearedTransactions;
  clearedTransactions = null;

  updateUI();

  // Disable Undo after restoring
  undoAllBtn.disabled = true;
});


// Initial Render
// Trigger initial UI update and data load on script launch
updateUI();