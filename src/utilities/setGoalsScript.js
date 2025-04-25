// Savings Goals Functionality
let goals = JSON.parse(localStorage.getItem("goals")) || [];

// Add new goal
function addNewGoal() {
  const name = document.getElementById("goal-name").value;
  const targetAmount = parseFloat(document.getElementById("goal-amount").value);
  const targetDate = document.getElementById("goal-date").value;
  const initialAmount =
    parseFloat(document.getElementById("initial-amount").value) || 0;

  if (!name || !targetAmount || !targetDate) {
    alert("Please fill in all required fields");
    return;
  }

  const newGoal = {
    id: Date.now(),
    name,
    targetAmount,
    targetDate,
    currentAmount: initialAmount,
    createdAt: new Date().toISOString(),
  };

  goals.push(newGoal);
  updateGoalsInLocalStorage();
  updateGoalsList();

  // Clear form
  document.getElementById("goal-name").value = "";
  document.getElementById("goal-amount").value = "";
  document.getElementById("goal-date").value = "";
  document.getElementById("initial-amount").value = "0";
}

// Update goals list
function updateGoalsList() {
  const goalsList = document.getElementById("goals-list");
  goalsList.innerHTML = "";

  if (goals.length === 0) {
    goalsList.innerHTML = "<p>No savings goals yet. Add one below!</p>";
    return;
  }

  goals.forEach((goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    const targetDate = new Date(goal.targetDate);
    const daysLeft = Math.ceil(
      (targetDate - new Date()) / (1000 * 60 * 60 * 24)
    );

    const goalElement = document.createElement("div");
    goalElement.classList.add("goal-item");
    goalElement.innerHTML = `
      <div class="goal-header">
        <div class="goal-title">${goal.name}</div>
        <div class="goal-actions">
          <button class="edit-goal" onclick="editGoal(${goal.id})">Edit</button>
          <button class="delete-goal" onclick="deleteGoal(${
            goal.id
          })">Delete</button>
          <button class="contribute" onclick="contributeToGoal(${
            goal.id
          })">Add Funds</button>
        </div>
      </div>
      <div class="goal-details">
        <div>Target: Rs. ${goal.targetAmount.toFixed(
          2
        )} | Current: Rs. ${goal.currentAmount.toFixed(2)}</div>
        <div>Remaining: Rs. ${remaining.toFixed(2)} | Target Date: ${formatDate(
      goal.targetDate
    )}</div>
        <div>${
          daysLeft > 0 ? `${daysLeft} days remaining` : "Goal date passed"
        }</div>
      </div>
      <div class="goal-progress">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <div class="goal-stats">
        <span>${progress.toFixed(1)}% complete</span>
        <span>${
          daysLeft > 0
            ? `Need Rs. ${(remaining / daysLeft).toFixed(2)}/day to reach goal`
            : "Goal date passed"
        }</span>
      </div>
    `;

    goalsList.appendChild(goalElement);
  });
}

// Delete goal
function deleteGoal(id) {
  if (confirm("Are you sure you want to delete this goal?")) {
    goals = goals.filter((goal) => goal.id !== id);
    updateGoalsInLocalStorage();
    updateGoalsList();
  }
}

// Edit goal modal
function editGoal(id) {
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  // For simplicity, use prompt - in a real app, use a modal
  const newAmount = prompt("Update current amount:", goal.currentAmount);
  if (newAmount !== null) {
    goal.currentAmount = parseFloat(newAmount);
    updateGoalsInLocalStorage();
    updateGoalsList();
  }
}

// Contribute to goal
function contributeToGoal(id) {
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  const contribution = parseFloat(prompt("Enter contribution amount:"));
  if (!isNaN(contribution) && contribution > 0) {
    goal.currentAmount += contribution;
    updateGoalsInLocalStorage();
    updateGoalsList();
  }
}

// Helper function to format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Update local storage with goals
function updateGoalsInLocalStorage() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

const addGoalBtn = document.getElementById("add-goal-btn");
addGoalBtn.addEventListener("click", addNewGoal);

document.addEventListener("DOMContentLoaded", function () {
  updateGoalsList();
});
