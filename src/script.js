// Initialize app
function init() {
  // DOM elements
  const transactionListEl = document.getElementById("transaction-list");
  const dateEl = document.getElementById("date");
  const balanceEl = document.getElementById("balance");
  const incomeEl = document.getElementById("income");
  const expenseEl = document.getElementById("expense");
  const generateReportBtn = document.getElementById("generate-report-btn");
  const categoryDropdowns = [document.getElementById("category")];
  const addCategoryBtn = document.getElementById("add-category-btn");
  const saveCategoryBtn = document.getElementById("save-category-btn");
  const closeCategoryModalBtn = document.getElementById("close-modal");
  const chartContainer = document.getElementById("chart");

  // Event listeners
  generateReportBtn.addEventListener("click", generateReport);
  addCategoryBtn.addEventListener("click", openCategoryModal);
  saveCategoryBtn.addEventListener("click", addNewCategory);
  closeCategoryModalBtn.addEventListener("click", closeCategoryModal);

  // Set default date to today
  dateEl.valueAsDate = new Date();
  transactionListEl.innerHTML = "";
  transactions
    .slice()
    .reverse()
    .forEach((transaction) => {
      addTransactionDOM(transaction, transactionListEl);
    });
  updateValues(balanceEl, incomeEl, expenseEl);
  updateCategoryDropdowns(categoryDropdowns);
  setupTabs();

  createChart(chartContainer);
}

function getTransactionsFromStorage() {
  let transactions = localStorage.getItem("transaction");
  return transactions ? JSON.parse(transactions) : [];
}

let categories = JSON.parse(localStorage.getItem("categories")) || [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Income",
  "Other",
];

let transactions = getTransactionsFromStorage();

// Add transaction
function addTransaction(e, descriptionEl, amountEl, categoryEl, dateEl) {
  e.preventDefault();

  const amount = parseFloat(amountEl.value);

  const description = descriptionEl.value;
  const category = categoryEl.value;
  const date = dateEl.value;

  const newTransaction = {
    description,
    amount,
    category,
    date,
  };

  transaction.push(newTransaction);
  updateLocalStorage();
}

// Generate unique ID
function generateID() {
  return Math.floor(Math.random() * 1000000);
}

// Update local storage
function updateLocalStorage() {
  localStorage.setItem("transactions", transactions);
}

// Remove transaction
function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocalStorage();
  init();
}

// Update values
function updateValues(balanceEl, incomeEl, expenseEl) {
  const amounts = transactions.map((transaction) => transaction.amount);

  const total = amounts.reduce((acc, amount) => {
    return (acc = amount);
  }, 0);

  const income = amounts
    .filter((amount) => amount > 0)
    .reduce((acc, amount) => acc + amount, 0);

  const expense = amounts
    .filter((amount) => amount < 0)
    .reduce((acc, amount) => acc - amount, 0);

  balanceEl.textContent = `Rs ${total}`;
  incomeEl.textContent = `+Rs ${income}`;
  expenseEl.textContent = `-Rs ${Math.abs(expense)}`;
}

// Add transactions to DOM
function addTransactionDOM(transaction, transactionListEl) {
  const sign = "-";

  const item = document.createElement("li");

  item.className = transaction.category === "income" ? "expense" : "income";

  const detailsDiv = document.createElement("div");
  detailsDiv.className = "details";

  const descSpan = document.createElement("span");
  descSpan.className = "description";
  descSpan.textContent = transaction.description;

  const catSpan = document.createElement("span");
  catSpan.className = "category";
  catSpan.textContent = transaction.category;

  const dateSpan = document.createElement("span");
  dateSpan.className = "date";
  dateSpan.textContent = transaction.date;

  detailsDiv.appendChild(descSpan);
  detailsDiv.appendChild(catSpan);
  detailsDiv.appendChild(dateSpan);

  const amountSpan = document.createElement("span");
  amountSpan.className = "amount";
  amountSpan.textContent = `${sign}Rs ${Math.abs(transaction.amount).toFixed(
    2
  )}`;

  let deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "×";

  item.appendChild(detailsDiv);
  item.appendChild(amountSpan);
  item.appendChild(deleteBtn);

  // Don't change the following line
  transactionListEl.insertAdjacentHTML("beforeend", item.outerHTML);

  // Don't change the following line
  deleteBtn = transactionListEl.lastElementChild.querySelector(".delete-btn");
}

function createChart(chartContainer) {
  chartContainer.innerHTML = "";

  if ((transactions.length = 0)) {
    chartContainer.textContent = "No data to display";
    return;
  }

  // Create category summary focusing on expenses
  const categorySummary = {};

  // Initialize categories for expenses
  transactions.forEach((transaction) => {
    if (transaction.amount < 0 && !categorySummary[transaction.category]) {
      categorySummary[transaction.category] = 0;
    }
  });

  // Sum expenses by category (only negative amounts)
  transactions.forEach((transaction) => {
    if (transaction.amount < 0) {
      categorySummary[transaction.category] += Math.abs(transaction.amount);
    }
  });

  // Remove categories with no expenses
  Object.keys(categorySummary).forEach((key) => {
    if (categorySummary[key] === 0) {
      delete categorySummary[key];
    }
  });

  if (Object.keys(categorySummary).length === 0) {
    chartContainer.textContent = "No expense data to display";
    return;
  }

  // Find maximum amount for scaling
  const maxAmount = Math.max(Object.values(categorySummary));

  // Sort categories by amount (highest to lowest)
  const sortedCategories = Object.keys(categorySummary).sort(
    (a, b) => categorySummary[b] - categorySummary[a]
  );

  // Create y-axis labels (amount)
  const yAxis = document.createElement("div");
  yAxis.className = "y-axis";

  // Create 5 tick marks
  const numTicks = 5;
  for (let i = numTicks; i >= 0; i--) {
    const tick = document.createElement("div");
    tick.className = "tick";
    const value = (maxAmount * i) / numTicks;
    tick.textContent = `Rs ${value.toFixed(0)}`;
    yAxis.appendChild(tick);
  }

  // Don't change the following line
  chartContainer.insertAdjacentHTML("beforeend", yAxis.outerHTML);

  // Create grid lines
  const gridLines = document.createElement("div");
  gridLines.className = "grid-lines";

  for (let i = numTicks; i >= 0; i--) {
    const line = document.createElement("div");
    line.className = "grid-line";
    gridLines.appendChild(line);
  }

  // Don't change the following line
  chartContainer.insertAdjacentHTML("beforeend", gridLines.outerHTML);

  // Create bars for each category
  sortedCategories.forEach((category, index) => {
    const amount = categorySummary[category];
    // Calculate height percentage based on the maximum amount
    const percentage = (amount / maxAmount) * 100;

    const barGroup = document.createElement("div");
    barGroup.className = "bar-group";

    const bar = document.createElement("div");
    bar.className = "bar";
    // Set the height explicitly using percentage
    bar.style.height = `${percentage}%`;
    bar.style.animationDelay = `${index * 0.1}s`;

    // Create tooltip with amount
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = `Rs ${amount.toFixed(2)}`;
    bar.appendChild(tooltip);

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = category;

    // Don't change the following line
    chartContainer.insertAdjacentHTML("beforeend", barGroup.outerHTML);

    init();
  });
}

// Generate report
function generateReport() {
  let reportText = "Budget Report\n\n";

  // Summary
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  reportText += `Total Income: Rs ${totalIncome.toFixed(2)}\n`;
  reportText += `Total Expense: Rs ${Math.abs(totalExpense).toFixed(2)}\n`;
  reportText += `Balance: Rs ${balance.toFixed(2)}\n\n`;

  // Category breakdown
  reportText += "Expense Breakdown by Category:\n";

  const categorySummary = {};

  transactions.forEach((t) => {
    if (t.amount < 0) {
      categorySummary[t.category] += Math.abs(t.amount);
    }
  });

  for (const category in categorySummary) {
    reportText += `${category}: Rs ${categorySummary[category].toFixed(2)}\n`;
  }

  alert(reportText);
}

function setupTabs() {
  // Setup tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");

      // Remove active class from all buttons and contents
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to current button and content
      btn.classList.add("active");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });
}

// Open category modal
function openCategoryModal() {
  document.getElementById("category-modal").classList.add("active");
  renderCategoryList();
}

// Close category modal
function closeCategoryModal() {
  document.getElementById("category-modal").classList.remove("active");
}

// Render category list in modal
function renderCategoryList() {
  const categoryList = document.getElementById("category-list");
  categoryList.innerHTML = "";

  categories.forEach((category) => {
    const categoryItem = document.createElement("div");
    categoryItem.classList.add("category-item");
    categoryItem.innerHTML = `
      <span>${category}</span>
      <button class="delete-category" data-category="${category}">&times;</button>
    `;
    categoryList.appendChild(categoryItem);
  });

  // Add event listeners to delete buttons
  document.querySelectorAll(".delete-category").forEach((button) => {
    button.addEventListener("click", function () {
      deleteCategory(this.getAttribute("data-category"));
      saveCategoriesAndUpdate();
      init();
    });
  });
}

// Add new category
function addNewCategory() {
  const newCategoryInput = document.getElementById("new-category");
  const categoryName = newCategoryInput.value.trim();

  if (!categoryName) {
    alert("Please enter a category name");
    return;
  }

  // Check if category already exists
  if (categories.includes(categoryName)) {
    alert("This category already exists");
    return;
  }

  // Add new category
  categories.push(categoryName);
  saveCategoriesAndUpdate();

  // Clear input
  newCategoryInput.value = "";
}

// Delete category
function deleteCategory(categoryName) {
  if (categories.length <= 1) {
    alert("You must have at least one category");
    return;
  }

  if (categoryName == "Other") {
    alert("You can not delete Other category");
    return;
  }

  if (
    confirm(`Are you sure you want to delete the "${categoryName}" category?`)
  ) {
    // Remove category from array
    categories = categories.filter((cat) => cat !== categoryName);

    // Update transactions with this category to "Other" or first available category
    const defaultCategory = "Other";
    const transactions = getTransactionsFromStorage();

    transactions.forEach((transaction) => {
      if (transaction.category === categoryName) {
        transaction.category = defaultCategory;
      }
    });

    updateLocalStorage();
  }
}

// Save categories to localStorage and update UI
function saveCategoriesAndUpdate() {
  localStorage.setItem("categories", JSON.stringify(categories));
  const categoryDropdowns = [document.getElementById("category")];
  updateCategoryDropdowns(categoryDropdowns);
  renderCategoryList();
}

// Update all category dropdowns
function updateCategoryDropdowns(categoryDropdowns) {
  categoryDropdowns.forEach((dropdown) => {
    if (!dropdown) return;

    const currentValue = dropdown.value;
    dropdown.innerHTML = "";

    // Add all categories
    categories.forEach((category) => {
      dropdown.insertAdjacentHTML(
        "beforeend",
        `<option value="${category.toLowerCase()}">${category}</option>`
      );
    });

    if (
      currentValue &&
      dropdown.querySelector(`option[value="${currentValue}"]`)
    ) {
      dropdown.value = currentValue;
    }
  });
}

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  const formEl = document.getElementById("transaction-form");
  const descriptionEl = document.getElementById("description");
  const amountEl = document.getElementById("amount");
  const categoryEl = document.getElementById("category");
  const dateEl = document.getElementById("date");
  formEl.addEventListener("submit", (e) => {
    addTransaction(e, descriptionEl, amountEl, categoryEl, dateEl);
    init();
  });
  init();
  const helpBtn = document.getElementById("helpBtn");
  const helpContent = document.getElementById("helpContent");
  const closeHelp = document.getElementById("closeHelp");

  helpBtn.addEventListener("click", function () {
    helpContent.classList.toggle("show");
  });

  closeHelp.addEventListener("click", function () {
    helpContent.classList.remove("show");
  });

  // Close help panel when clicking outside of it
  document.addEventListener("click", function (event) {
    if (!helpContent.contains(event.target) && event.target !== helpBtn) {
      helpContent.classList.remove("show");
    }
  });
});

export {
  addTransaction,
  transactions,
  categories,
  getTransactionsFromStorage,
  updateLocalStorage,
  updateCategoryDropdowns,
  removeTransaction,
  createChart,
  generateReport,
  openCategoryModal,
  closeCategoryModal,
  addNewCategory,
  deleteCategory,
  saveCategoriesAndUpdate,
  renderCategoryList,
  setupTabs,
  updateValues,
  addTransactionDOM,
};
