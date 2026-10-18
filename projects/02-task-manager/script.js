let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingId = null;
let currentFilter = 'all';
let currentSort = 'date';

const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskPriority = document.getElementById('taskPriority');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompleted = document.getElementById('clearCompleted');
const themeToggle = document.getElementById('themeToggle');

const editModal = document.getElementById('editModal');
const editTitle = document.getElementById('editTitle');
const editDate = document.getElementById('editDate');
const editPriority = document.getElementById('editPriority');
const saveEdit = document.getElementById('saveEdit');
const cancelEdit = document.getElementById('cancelEdit');

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

// Add task
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

function addTask() {
  const title = taskInput.value.trim();
  if (!title) return;

  const task = {
    id: Date.now(),
    title,
    dueDate: taskDate.value,
    priority: taskPriority.value,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  
  taskInput.value = '';
  taskDate.value = '';
  taskPriority.value = 'medium';
}

// Filters
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Search
searchInput.addEventListener('input', renderTasks);

// Sort
sortSelect.addEventListener('change', (e) => {
  currentSort = e.target.value;
  renderTasks();
});

// Clear completed
clearCompleted.addEventListener('click', () => {
  if (confirm('Delete all completed tasks?')) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
  }
});

// Render
function renderTasks() {
  const search = searchInput.value.toLowerCase();
  
  let filtered = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search);
    const matchesFilter = 
      currentFilter === 'all' ||
      (currentFilter === 'active' && !task.completed) ||
      (currentFilter === 'completed' && task.completed);
    return matchesSearch && matchesFilter;
  });

  // Sort
  filtered.sort((a, b) => {
    if (currentSort === 'priority') {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    } else if (currentSort === 'title') {
      return a.title.localeCompare(b.title);
    } else {
      return new Date(b.dueDate || b.createdAt) - new Date(a.dueDate || a.createdAt);
    }
  });

  if (filtered.length === 0) {
    tasksList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem">No tasks found</p>';
  } else {
    tasksList.innerHTML = filtered.map(task => `
      <div class="task-item ${task.completed ? 'completed' : ''}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
               onchange="toggleTask(${task.id})">
        <div class="task-content">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span class="priority ${task.priority}">${task.priority}</span>
            ${task.dueDate ? `<span>📅 ${task.dueDate}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="icon-btn" onclick="openEdit(${task.id})" title="Edit">✏️</button>
          <button class="icon-btn" onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  updateStats();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  if (confirm('Delete this task?')) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }
}

function openEdit(id) {
  editingId = id;
  const task = tasks.find(t => t.id === id);
  if (task) {
    editTitle.value = task.title;
    editDate.value = task.dueDate;
    editPriority.value = task.priority;
    editModal.classList.add('active');
  }
}

saveEdit.addEventListener('click', () => {
  const task = tasks.find(t => t.id === editingId);
  if (task) {
    task.title = editTitle.value.trim();
    task.dueDate = editDate.value;
    task.priority = editPriority.value;
    saveTasks();
    renderTasks();
  }
  editModal.classList.remove('active');
});

cancelEdit.addEventListener('click', () => {
  editModal.classList.remove('active');
});

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) {
    editModal.classList.remove('active');
  }
});

function updateStats() {
  document.getElementById('totalTasks').textContent = tasks.length;
  document.getElementById('activeTasks').textContent = tasks.filter(t => !t.completed).length;
  document.getElementById('completedTasks').textContent = tasks.filter(t => t.completed).length;
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

renderTasks();
