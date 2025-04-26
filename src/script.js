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
  let transactions = localStorage.getItem("transactions");
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

  const description = descriptionEl.value.trim();
  const amountInput = amountEl.value.trim();
  const amount = parseFloat(amountInput);
  const category = categoryEl.value;
  const date = dateEl.value;

  // Enhanced input validation
  if (!description) {
    alert("Please enter a description");
    return;
  }
  if (isNaN(amount) || amountInput === "") {
    alert("Please enter a valid amount");
    return;
  }
  if (amount === 0) {
    alert("Amount cannot be zero");
    return;
  }
  if (!category) {
    alert("Please select a category");
    return;
  }
  if (!date) {
    alert("Please select a date");
    return;
  }

  const newTransaction = {
    id: generateID(),
    description,
    amount,
    category,
    date,
  };

  transactions.push(newTransaction);
  updateLocalStorage();

  // Clear form
  descriptionEl.value = "";
  amountEl.value = "";
  dateEl.valueAsDate = new Date();
  categoryEl.value = categories[0] || "Other";

  // Update UI
  init();
}

// Generate unique ID
function generateID() {
  return Math.floor(Math.random() * 1000000);
}

// Update local storage
function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Remove transaction
function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocalStorage();
  init();
}

// Update values
function updateValues(balanceEl, incomeEl, expenseEl) {
  if (!balanceEl || !incomeEl || !expenseEl) {
    console.error("One or more DOM elements are missing");
    return;
  }

  const amounts = transactions.map((transaction) => transaction.amount);

  const total = amounts.length
    ? amounts.reduce((acc, amount) => acc + amount, 0).toFixed(2)
    : "0.00";

  const income = amounts
    .filter((amount) => amount > 0)
    .reduce((acc, amount) => acc + amount, 0)
    .toFixed(2);

  const expense = amounts
    .filter((amount) => amount < 0)
    .reduce((acc, amount) => acc + amount, 0)
    .toFixed(2);

  // Consistent formatting
  const formattedTotal = total === "-0.00" ? "0.00" : total;
  const formattedIncome = income === "0.00" ? "0.00" : income;
  const formattedExpense = expense === "-0.00" ? "0.00" : Math.abs(expense).toFixed(2);

  balanceEl.textContent = `Rs ${formattedTotal}`;
  incomeEl.textContent = `+Rs ${formattedIncome}`;
  expenseEl.textContent = `-Rs ${formattedExpense}`;
}

// Add transactions to DOM
function addTransactionDOM(transaction, transactionListEl) {
  const sign = transaction.amount > 0 ? "+" : "-";
  const isIncome = transaction.amount > 0;

  const item = document.createElement("li");
  item.className = isIncome ? "income" : "expense";

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
  amountSpan.textContent = `${sign}Rs ${Math.abs(transaction.amount).toFixed(2)}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "×";
  deleteBtn.addEventListener("click", () => removeTransaction(transaction.id));

  item.appendChild(detailsDiv);
  item.appendChild(amountSpan);
  item.appendChild(deleteBtn);

  transactionListEl.appendChild(item);
}

function createChart(chartContainer) {
  chartContainer.innerHTML = "";

  if (transactions.length === 0) {
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
  const maxAmount = Math.max(...Object.values(categorySummary));

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

  chartContainer.appendChild(yAxis);

  // Create grid lines
  const gridLines = document.createElement("div");
  gridLines.className = "grid-lines";

  for (let i = numTicks; i >= 0; i--) {
    const line = document.createElement("div");
    line.className = "grid-line";
    gridLines.appendChild(line);
  }

  chartContainer.appendChild(gridLines);

  // Create bars for each category
  sortedCategories.forEach((category, index) => {
    const amount = categorySummary[category];
    const percentage = (amount / maxAmount) * 100;

    const barGroup = document.createElement("div");
    barGroup.className = "bar-group";

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${percentage}%`;
    bar.style.animationDelay = `${index * 0.1}s`;

    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = `Rs ${amount.toFixed(2)}`;
    bar.appendChild(tooltip);

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = category;

    barGroup.appendChild(bar);
    barGroup.appendChild(label);

    chartContainer.appendChild(barGroup);
  });
}

// Generate report
async function generateReport() {
  try {
    const { generateReport: generateReportPDF } = await import("./utilities/generateReport.js");
    generateReportPDF();
  } catch (error) {
    console.error("Error generating PDF report:", error);
    alert("Failed to generate PDF report. Please try again.");
  }
}

function setupTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");

      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

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
      <button class="delete-category" data-category="${category}">×</button>
    `;
    categoryList.appendChild(categoryItem);
  });

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

  if (categories.includes(categoryName)) {
    alert("This category already exists");
    return;
  }

  categories.push(categoryName);
  saveCategoriesAndUpdate();

  newCategoryInput.value = "";
}

// Delete category
function deleteCategory(categoryName) {
  if (categories.length <= 1) {
    alert("You must have at least one category");
    return;
  }

  if (categoryName === "Other") {
    alert("You cannot delete the Other category");
    return;
  }

  if (
    confirm(`Are you sure you want to delete the "${categoryName}" category?`)
  ) {
    categories = categories.filter((cat) => cat !== categoryName);

    const defaultCategory = "Other";
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

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      dropdown.appendChild(option);
    });

    // Set to current value if it exists, otherwise default to first category
    dropdown.value = categories.includes(currentValue) ? currentValue : categories[0] || "Other";
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