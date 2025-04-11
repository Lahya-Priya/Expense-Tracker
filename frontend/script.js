// DOM Elements
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const historyList = document.getElementById('history-list');
const welcomeMessage = document.getElementById('welcome-message');

// Forms
const incomeForm = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');

// Input Fields
const incomeText = document.getElementById('income-text');
const incomeAmount = document.getElementById('income-amount');
const expenseText = document.getElementById('expense-text');
const expenseAmount = document.getElementById('expense-amount');

// Get username from localStorage
const username = localStorage.getItem('username');

if (!username) {
  alert("You are not logged in!");
  window.location.href = 'login.html';
} else {
  welcomeMessage.innerText = `Welcome to Expenses Tracker, ${username}!`;
}

// Retrieve transactions from localStorage or set empty array
let transactions = JSON.parse(localStorage.getItem(`transactions_${username}`)) || [];
let editingTransactionId = null;

// ✅ Add/Edit Income Transaction
incomeForm.addEventListener('submit', function (e) {
  e.preventDefault();

  if (incomeText.value.trim() === '' || incomeAmount.value.trim() === '') {
    alert('Please enter description and amount for income.');
    return;
  }

  const text = incomeText.value;
  const amount = parseFloat(incomeAmount.value);
  const date = new Date().toLocaleDateString();

  if (isNaN(amount)) {
    alert("Invalid amount entered for income.");
    return;
  }

  if (editingTransactionId !== null) {
    const index = transactions.findIndex(t => t.id === editingTransactionId);
    transactions[index] = { ...transactions[index], text, amount, date };
    editingTransactionId = null;
  } else {
    const transaction = {
      id: generateID(),
      text,
      amount,
      date
    };
    transactions.push(transaction);
  }

  updateLocalStorage();
  updateUI();

  incomeText.value = '';
  incomeAmount.value = '';
});

// ✅ Add/Edit Expense Transaction
expenseForm.addEventListener('submit', function (e) {
  e.preventDefault();

  if (expenseText.value.trim() === '' || expenseAmount.value.trim() === '') {
    alert('Please enter description and amount for expense.');
    return;
  }

  const text = expenseText.value;
  const amount = -Math.abs(parseFloat(expenseAmount.value));
  const date = new Date().toLocaleDateString();

  if (isNaN(amount)) {
    alert("Invalid amount entered for expense.");
    return;
  }

  if (editingTransactionId !== null) {
    const index = transactions.findIndex(t => t.id === editingTransactionId);
    transactions[index] = { ...transactions[index], text, amount, date };
    editingTransactionId = null;
  } else {
    const transaction = {
      id: generateID(),
      text,
      amount,
      date
    };
    transactions.push(transaction);
  }

  updateLocalStorage();
  updateUI();

  expenseText.value = '';
  expenseAmount.value = '';
});

// ✅ Generate unique ID
function generateID() {
  return Math.floor(Math.random() * 1000000);
}

// ✅ Update UI
function updateUI() {
  historyList.innerHTML = '';

  transactions.forEach(transaction => {
    const sign = transaction.amount < 0 ? '-' : '+';
    const type = transaction.amount < 0 ? 'minus' : 'plus';
    const item = document.createElement('li');
    item.classList.add(type);

    item.innerHTML = `
      <span class="editable-desc" data-id="${transaction.id}">
        <strong>${transaction.text}</strong><br><small>${transaction.date}</small>
      </span>
      <span class="amount-delete">
        <span class="amount">${sign}₹${Math.abs(transaction.amount).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">🚮</button>
      </span>
    `;

    historyList.appendChild(item);
  });

  document.querySelectorAll('.editable-desc').forEach(span => {
    span.style.cursor = 'pointer';
    span.title = "Click to edit";
    span.addEventListener('click', function () {
      const id = parseInt(span.getAttribute('data-id'));
      editTransaction(id);
    });
  });

  const amounts = transactions.map(transaction => transaction.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0);
  const income = amounts.filter(item => item > 0).reduce((acc, item) => acc + item, 0);
  const expense = Math.abs(amounts.filter(item => item < 0).reduce((acc, item) => acc + item, 0));

  balance.innerText = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  money_plus.innerText = `+₹${income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  money_minus.innerText = `-₹${expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

// ✅ Edit Transaction
function editTransaction(id) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return;

  editingTransactionId = id;

  if (tx.amount >= 0) {
    incomeText.value = tx.text;
    incomeAmount.value = tx.amount;
  } else {
    expenseText.value = tx.text;
    expenseAmount.value = Math.abs(tx.amount);
  }

  alert("Editing: Please submit the updated values.");
}

// ✅ Remove Transaction
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  updateLocalStorage();
  updateUI();
}

// ✅ Update Local Storage
function updateLocalStorage() {
  localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
}

// ✅ Daily Reminder Notifications
document.addEventListener('DOMContentLoaded', () => {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  scheduleDailyReminder();
});

function scheduleDailyReminder() {
  const now = new Date();
  const targetHour = 12; // 8 PM
  const targetMinute = 0;

  const targetTime = new Date();
  targetTime.setHours(targetHour, targetMinute, 0, 0);

  if (now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeout = targetTime - now;

  setTimeout(() => {
    showReminderNotification();
    setInterval(showReminderNotification, 24 * 60 * 60 * 1000);
  }, timeout);
}

function showReminderNotification() {
  if (Notification.permission === 'granted') {
    new Notification('💸 Expense Reminder', {
      body: 'Hey! Don’t forget to log today’s expenses.',
      icon: 'money.png' // Optional icon path
    });
  }
}

// ✅ Initialize
updateUI();
