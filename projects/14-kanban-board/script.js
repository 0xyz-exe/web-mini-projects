let tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || { todo: [], progress: [], done: [] };
let currentColumn = '';
let editingId = null;

const modal = document.getElementById('modal');
const taskTitle = document.getElementById('taskTitle');
const taskPriority = document.getElementById('taskPriority');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const themeToggle = document.getElementById('themeToggle');

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

saveBtn.addEventListener('click', saveTask);
cancelBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

function openModal(column, taskId = null) {
  currentColumn = column;
  editingId = taskId;

  if (taskId) {
    const task = tasks[column].find(t => t.id === taskId);
    taskTitle.value = task.title;
    taskPriority.value = task.priority;
  } else {
    taskTitle.value = '';
    taskPriority.value = 'medium';
  }

  modal.classList.add('active');
  taskTitle.focus();
}

function closeModal() {
  modal.classList.remove('active');
  editingId = null;
}

function saveTask() {
  const title = taskTitle.value.trim();
  if (!title) {
    alert('Task title required');
    return;
  }

  if (editingId) {
    const task = tasks[currentColumn].find(t => t.id === editingId);
    task.title = title;
    task.priority = taskPriority.value;
  } else {
    const task = {
      id: Date.now(),
      title,
      priority: taskPriority.value
    };
    tasks[currentColumn].push(task);
  }

  saveTasks();
  render();
  closeModal();
}

function deleteTask(column, id) {
  if (confirm('Delete this task?')) {
    tasks[column] = tasks[column].filter(t => t.id !== id);
    saveTasks();
    render();
  }
}

function moveTask(id, fromColumn, toColumn) {
  const taskIndex = tasks[fromColumn].findIndex(t => t.id === id);
  if (taskIndex === -1) return;

  const [task] = tasks[fromColumn].splice(taskIndex, 1);
  tasks[toColumn].push(task);
  saveTasks();
  render();
}

function render() {
  ['todo', 'progress', 'done'].forEach(column => {
    const container = document.getElementById(`${column}Tasks`);
    const columnTasks = tasks[column];

    container.innerHTML = columnTasks.map(task => `
      <div class="task-card" draggable="true" data-id="${task.id}" data-column="${column}">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <span class="task-priority priority-${task.priority}">${task.priority}</span>
        <div class="task-actions">
          <button class="icon-btn" onclick="openModal('${column}', ${task.id})" title="Edit">✏️</button>
          <button class="icon-btn" onclick="deleteTask('${column}', ${task.id})" title="Delete">🗑️</button>
          ${column !== 'done' ? `<button class="icon-btn" onclick="moveTask(${task.id}, '${column}', '${column === 'todo' ? 'progress' : 'done'}')" title="Move">➡️</button>` : ''}
          ${column !== 'todo' ? `<button class="icon-btn" onclick="moveTask(${task.id}, '${column}', '${column === 'done' ? 'progress' : 'todo'}')" title="Move Back">⬅️</button>` : ''}
        </div>
      </div>
    `).join('');

    document.getElementById(`${column}Count`).textContent = columnTasks.length;
  });

  setupDragAndDrop();
}

function setupDragAndDrop() {
  const cards = document.querySelectorAll('.task-card');
  const columns = document.querySelectorAll('.tasks');

  cards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
  });

  columns.forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);
  });
}

let draggedTask = null;

function handleDragStart(e) {
  draggedTask = {
    id: parseInt(e.target.dataset.id),
    fromColumn: e.target.dataset.column
  };
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  if (!draggedTask) return;

  const toColumn = e.target.closest('.tasks').dataset.column;
  if (toColumn !== draggedTask.fromColumn) {
    moveTask(draggedTask.id, draggedTask.fromColumn, toColumn);
  }
  draggedTask = null;
}

function saveTasks() {
  localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

render();
